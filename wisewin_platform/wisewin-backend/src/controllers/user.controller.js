import { db } from "../database/db.js";
import { ApiError } from "../utils/apiError.js";
import { comparePassword, hashPassword } from "../utils/password.js";

export function changePassword(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const { oldPassword, newPassword } = req.body;

    if (!newPassword) {
      throw new ApiError(400, "newPassword is required");
    }

    const targetUser = db.prepare(`
      SELECT
        u.id,
        u.company_id AS companyId,
        u.password_hash AS passwordHash,
        r.name AS role
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = ?
    `).get(userId);

    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    const isSelf = req.user.sub === userId;
    const isAdmin = req.user.role === "Administrator";
    const isSuperUser = req.user.role === "Super user";

    if (!isSelf && !isAdmin && !isSuperUser) {
      throw new ApiError(403, "Forbidden");
    }

    if (isSuperUser && !isSelf && req.user.companyId !== targetUser.companyId) {
      throw new ApiError(403, "You can only manage users of your company");
    }

    if (isSelf) {
      if (!oldPassword) {
        throw new ApiError(400, "oldPassword is required");
      }

      const isValid = comparePassword(oldPassword, targetUser.passwordHash);
      if (!isValid) {
        throw new ApiError(401, "Invalid old password");
      }
    }

    const newHash = hashPassword(newPassword);

    db.prepare(`
      UPDATE users
      SET
        password_hash = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newHash, userId);

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
}

export function createUser(req, res, next) {
  try {
    const { companyId, email, password, role } = req.body;

    if (!email || !password || !role) {
      throw new ApiError(400, "email, password and role are required");
    }

    if (!["User", "Super user"].includes(role)) {
      throw new ApiError(400, "Invalid role");
    }

    if (req.user.role === "Super user" && role !== "User") {
      throw new ApiError(403, "Super user can only create normal users");
    }

    let resolvedCompanyId = companyId ?? null;

    if (req.user.role === "Super user") {
      resolvedCompanyId = req.user.companyId;
    }

    if (!resolvedCompanyId) {
      throw new ApiError(400, "companyId is required");
    }

    const existingUser = db
      .prepare(`SELECT id FROM users WHERE email = ?`)
      .get(email);

    if (existingUser) {
      throw new ApiError(409, "Email already exists");
    }

    const roleRow = db
      .prepare(`SELECT id, name FROM roles WHERE name = ?`)
      .get(role);

    if (!roleRow) {
      throw new ApiError(400, "Role not found");
    }

    const company = db
      .prepare(`SELECT id FROM companies WHERE id = ?`)
      .get(Number(resolvedCompanyId));

    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    const passwordHash = hashPassword(password);

    const result = db.prepare(`
      INSERT INTO users (
        company_id,
        role_id,
        email,
        password_hash,
        is_active,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(Number(resolvedCompanyId), roleRow.id, email, passwordHash);

    const createdUser = db.prepare(`
      SELECT
        u.id,
        u.email,
        u.company_id AS companyId,
        r.name AS role,
        u.is_active AS isActive
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({
      message: `${role} created successfully`,
      user: createdUser,
    });
  } catch (error) {
    next(error);
  }
}

export function getAllUsers(req, res, next) {
  try {
    const stmt = db.prepare(`
      SELECT
        u.id,
        u.email,
        u.is_active AS isActive,
        u.company_id AS companyId,
        c.name AS companyName,
        r.name AS role
      FROM users u
      LEFT JOIN companies c ON c.id = u.company_id
      INNER JOIN roles r ON r.id = u.role_id
      ORDER BY u.id DESC
    `);

    const users = stmt.all();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

export function getCompanyUsers(req, res, next) {
  try {
    const companyId = Number(req.params.companyId);

    if (req.user.role === "Super user" && req.user.companyId !== companyId) {
      throw new ApiError(403, "Forbidden");
    }

    const stmt = db.prepare(`
      SELECT
        u.id,
        u.email,
        u.is_active AS isActive,
        r.name AS role,
        (
          SELECT COUNT(*)
          FROM quiz_assignments qa
          WHERE qa.user_id = u.id
        ) AS assignedQuizzes,
        (
          SELECT COUNT(*)
          FROM quiz_assignments qa
          WHERE qa.user_id = u.id
            AND qa.status = 'COMPLETED'
        ) AS completedQuizzes
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.company_id = ?
      ORDER BY u.id DESC
    `);

    const users = stmt.all(companyId);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}