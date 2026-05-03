import { db } from "../database/db.js";
import { ApiError } from "../utils/apiError.js";
import { comparePassword, hashPassword } from "../utils/password.js";

export function changePassword(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const { oldPassword, newPassword } = req.body;

    if (!newPassword) throw new ApiError(400, "newPassword is required");

    const targetUser = db.prepare(`
      SELECT u.id, u.company_id AS companyId, u.password_hash AS passwordHash, r.name AS role
      FROM users u INNER JOIN roles r ON r.id = u.role_id WHERE u.id = ?
    `).get(userId);

    if (!targetUser) throw new ApiError(404, "User not found");

    const isSelf = req.user.sub === userId;
    const isAdmin = req.user.role === "Administrator";
    const isSuperUser = req.user.role === "Super user";

    if (!isSelf && !isAdmin && !isSuperUser) throw new ApiError(403, "Forbidden");
    if (isSuperUser && !isSelf && req.user.companyId !== targetUser.companyId)
      throw new ApiError(403, "You can only manage users of your company");

    if (isSelf) {
      if (!oldPassword) throw new ApiError(400, "oldPassword is required");
      const isValid = comparePassword(oldPassword, targetUser.passwordHash);
      if (!isValid) throw new ApiError(401, "Invalid old password");
    }

    db.prepare(`UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(hashPassword(newPassword), userId);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
}

export function createUser(req, res, next) {
  try {
    const { companyId, email, password, role } = req.body;

    if (!email || !password || !role) throw new ApiError(400, "email, password and role are required");
    if (!["User", "Super user"].includes(role)) throw new ApiError(400, "Invalid role");
    if (req.user.role === "Super user" && role !== "User")
      throw new ApiError(403, "Super user can only create normal users");

    let resolvedCompanyId = companyId ?? null;
    if (req.user.role === "Super user") resolvedCompanyId = req.user.companyId;
    if (!resolvedCompanyId) throw new ApiError(400, "companyId is required");

    const existingUser = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email);
    if (existingUser) throw new ApiError(409, "Email already exists");

    const roleRow = db.prepare(`SELECT id, name FROM roles WHERE name = ?`).get(role);
    if (!roleRow) throw new ApiError(400, "Role not found");

    const company = db.prepare(`SELECT id FROM companies WHERE id = ?`).get(Number(resolvedCompanyId));
    if (!company) throw new ApiError(404, "Company not found");

    const result = db.prepare(`
      INSERT INTO users (company_id, role_id, email, password_hash, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(Number(resolvedCompanyId), roleRow.id, email, hashPassword(password));

    const createdUser = db.prepare(`
      SELECT u.id, u.email, u.company_id AS companyId, r.name AS role, u.is_active AS isActive
      FROM users u INNER JOIN roles r ON r.id = u.role_id WHERE u.id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({ message: `${role} created successfully`, user: createdUser });
  } catch (error) {
    next(error);
  }
}

export function getAllUsers(req, res, next) {
  try {
    const users = db.prepare(`
      SELECT u.id, u.email, u.is_active AS isActive, u.company_id AS companyId,
             c.name AS companyName, r.name AS role
      FROM users u
      LEFT JOIN companies c ON c.id = u.company_id
      INNER JOIN roles r ON r.id = u.role_id
      ORDER BY u.id DESC
    `).all();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

export function updateUser(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const { email, role, companyId, isActive } = req.body;

    const existing = db.prepare(`
      SELECT u.id, u.company_id AS companyId, r.name AS role
      FROM users u INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = ?
    `).get(userId);

    if (!existing) throw new ApiError(404, "User not found");

    // Super user can only edit users in their own company
    if (req.user.role === "Super user") {
      if (existing.companyId !== req.user.companyId) {
        throw new ApiError(403, "You can only manage users in your company");
      }
      if (email || role || companyId) {
        throw new ApiError(403, "Super user can only change active status");
      }
    }

    if (email) {
      const duplicate = db.prepare(`SELECT id FROM users WHERE email = ? AND id != ?`).get(email, userId);
      if (duplicate) throw new ApiError(409, "Email already in use");
    }

    let roleId = null;
    if (role) {
      const roleRow = db.prepare(`SELECT id FROM roles WHERE name = ?`).get(role);
      if (!roleRow) throw new ApiError(400, "Invalid role");
      roleId = roleRow.id;
    }

    // Fix: convert isActive to SQLite-compatible 1/0/null
    let isActiveDb = null;
    if (isActive === true || isActive === 1 || isActive === "1") isActiveDb = 1;
    else if (isActive === false || isActive === 0 || isActive === "0") isActiveDb = 0;

    db.prepare(`
      UPDATE users SET
        email = COALESCE(?, email),
        role_id = COALESCE(?, role_id),
        company_id = COALESCE(?, company_id),
        is_active = CASE WHEN ? IS NOT NULL THEN ? ELSE is_active END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      email ?? null,
      roleId,
      companyId ?? null,
      isActiveDb,
      isActiveDb,
      userId
    );

    const updated = db.prepare(`
      SELECT u.id, u.email, u.is_active AS isActive, u.company_id AS companyId,
             c.name AS companyName, r.name AS role
      FROM users u
      LEFT JOIN companies c ON c.id = u.company_id
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = ?
    `).get(userId);

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

// ========================= 
// DELETE USER — unassign only, keep quizzes
// =========================
export function deleteUser(req, res, next) {
  try {
    const userId = Number(req.params.userId);
 
    const existing = db.prepare(`SELECT id FROM users WHERE id = ?`).get(userId);
    if (!existing) throw new ApiError(404, "User not found");
    if (req.user.sub === userId) throw new ApiError(400, "You cannot delete yourself");
 
    db.transaction(() => {
     
      db.prepare(`
        DELETE FROM quiz_attempt_answers
        WHERE attempt_id IN (
          SELECT at.id FROM quiz_attempts at
          INNER JOIN quiz_assignments qa ON qa.id = at.assignment_id
          WHERE qa.user_id = ?
        )
      `).run(userId);
 
     
      db.prepare(`
        DELETE FROM quiz_attempts
        WHERE assignment_id IN (
          SELECT id FROM quiz_assignments WHERE user_id = ?
        )
      `).run(userId);
 
     
      db.prepare(`DELETE FROM quiz_assignments WHERE user_id = ?`).run(userId);
 
   
      db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
    })();
 
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
}
 
export function getCompanyUsers(req, res, next) {
  try {
    const companyId = Number(req.params.companyId);
    if (req.user.role === "Super user" && req.user.companyId !== companyId)
      throw new ApiError(403, "Forbidden");

    const users = db.prepare(`
      SELECT u.id, u.email, u.is_active AS isActive, r.name AS role,
        (SELECT COUNT(*) FROM quiz_assignments qa WHERE qa.user_id = u.id) AS assignedQuizzes,
        (SELECT COUNT(*) FROM quiz_assignments qa WHERE qa.user_id = u.id AND qa.status = 'COMPLETED') AS completedQuizzes
      FROM users u INNER JOIN roles r ON r.id = u.role_id
      WHERE u.company_id = ? ORDER BY u.id DESC
    `).all(companyId);

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

export function getCompanyAssignmentStats(req, res, next) {
  try {
    const companyId = Number(req.params.companyId);
    if (req.user.role === "Super user" && req.user.companyId !== companyId)
      throw new ApiError(403, "Forbidden");

    const stats = db.prepare(`
      SELECT
        COUNT(*) AS totalAssignments,
        SUM(CASE WHEN qa.status IN ('ASSIGNED', 'IN_PROGRESS', 'OVERDUE') THEN 1 ELSE 0 END) AS pendingAssignments,
        SUM(CASE WHEN qa.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedAssignments
      FROM quiz_assignments qa
      INNER JOIN users u ON u.id = qa.user_id WHERE u.company_id = ?
    `).get(companyId);

    return res.status(200).json({
      totalAssignments: stats.totalAssignments ?? 0,
      pendingAssignments: stats.pendingAssignments ?? 0,
      completedAssignments: stats.completedAssignments ?? 0,
    });
  } catch (error) {
    next(error);
  }
}

export function getUserComparison(req, res, next) {
  try {
    const companyId = Number(req.params.companyId);
    if (req.user.role === "Super user" && req.user.companyId !== companyId)
      throw new ApiError(403, "Forbidden");

    const rows = db.prepare(`
      SELECT u.id AS userId, u.email,
        COUNT(DISTINCT qa.id) AS totalAssigned,
        COUNT(DISTINCT CASE WHEN qa.status = 'COMPLETED' THEN qa.id END) AS totalCompleted,
        COUNT(DISTINCT CASE WHEN qa.status IN ('ASSIGNED','IN_PROGRESS') THEN qa.id END) AS totalPending,
        COALESCE(AVG(
          CASE WHEN at2.passed = 1 AND at2.status = 'COMPLETED'
               THEN CAST(at2.current_score AS REAL) / NULLIF(qcount.cnt, 0) * 100 END
        ), 0) AS avgScore
      FROM users u
      LEFT JOIN quiz_assignments qa ON qa.user_id = u.id
      LEFT JOIN quiz_attempts at2 ON at2.assignment_id = qa.id AND at2.status = 'COMPLETED'
      LEFT JOIN (SELECT quiz_id, COUNT(*) AS cnt FROM questions GROUP BY quiz_id) qcount ON qcount.quiz_id = qa.quiz_id
      WHERE u.company_id = ? AND u.role_id = (SELECT id FROM roles WHERE name = 'User')
      GROUP BY u.id, u.email ORDER BY totalCompleted DESC, avgScore DESC
    `).all(companyId);

    return res.status(200).json(rows.map((r) => ({
      userId: r.userId, email: r.email, name: r.email.split("@")[0],
      totalAssigned: r.totalAssigned, totalCompleted: r.totalCompleted,
      totalPending: r.totalPending, avgScore: Math.round(r.avgScore),
    })));
  } catch (error) {
    next(error);
  }
}