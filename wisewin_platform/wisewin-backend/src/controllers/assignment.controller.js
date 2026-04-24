import { db } from "../database/db.js";
import { ApiError } from "../utils/apiError.js";

export function getMyAssignments(req, res, next) {
  try {
    if (req.user.role !== "User") {
      throw new ApiError(403, "Forbidden");
    }

    const stmt = db.prepare(`
      SELECT
        qa.id AS assignmentId,
        qa.quiz_id AS quizId,
        q.title AS quizTitle,
        q.description,
        qa.due_date AS dueDate,
        qa.status,
        (
          SELECT id
          FROM quiz_attempts
          WHERE assignment_id = qa.id AND status = 'IN_PROGRESS'
          LIMIT 1
        ) AS attemptId,
        
        (
          SELECT passed
          FROM quiz_attempts
          WHERE assignment_id = qa.id
            AND status = 'COMPLETED'
          ORDER BY attempt_number DESC
          LIMIT 1
        ) AS latestPassed,
        (
          SELECT current_score
          FROM quiz_attempts
          WHERE assignment_id = qa.id
            AND status = 'COMPLETED'
          ORDER BY attempt_number DESC
          LIMIT 1
        ) AS latestScore,
        (
          SELECT attempt_number
          FROM quiz_attempts
          WHERE assignment_id = qa.id
            AND status = 'COMPLETED'
          ORDER BY attempt_number DESC
          LIMIT 1
        ) AS latestAttemptNumber,
        (
          SELECT COUNT(*)
          FROM questions
          WHERE quiz_id = qa.quiz_id
        ) AS totalQuestions
      FROM quiz_assignments qa
      INNER JOIN quizzes q ON q.id = qa.quiz_id
      WHERE qa.user_id = ?
      ORDER BY qa.id DESC
    `);

    const assignments = stmt.all(req.user.sub).map((assignment) => ({
      ...assignment,
      latestPassed:
        assignment.latestPassed === null
          ? null
          : Boolean(assignment.latestPassed),
    }));

    return res.status(200).json(assignments);
  } catch (error) {
    next(error);
  }
}

export function createAssignment(req, res, next) {
  try {
    const quizId = Number(req.params.quizId);
    const { userId, dueDate } = req.body;

    if (!userId) {
      throw new ApiError(400, "userId is required");
    }

    const quizStmt = db.prepare(`
      SELECT id, company_id AS companyId, source_type AS sourceType, is_active AS isActive
      FROM quizzes
      WHERE id = ?
    `);
    const quiz = quizStmt.get(quizId);

    if (!quiz) {
      throw new ApiError(404, "Quiz not found");
    }

    if (!quiz.isActive) {
      throw new ApiError(400, "Quiz is inactive");
    }

    const userStmt = db.prepare(`
      SELECT u.id, u.company_id AS companyId, r.name AS role
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = ?
    `);
    const targetUser = userStmt.get(Number(userId));

    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    if (targetUser.role !== "User") {
      throw new ApiError(400, "Assignments can only be created for users");
    }

    if (req.user.role === "Super user") {
      if (req.user.companyId !== targetUser.companyId) {
        throw new ApiError(403, "You can only assign quizzes to users of your company");
      }

      if (quiz.sourceType === "COMPANY" && quiz.companyId !== req.user.companyId) {
        throw new ApiError(403, "You cannot assign another company's quiz");
      }
    }

    if (quiz.sourceType === "COMPANY" && quiz.companyId !== targetUser.companyId) {
      throw new ApiError(400, "Company quiz can only be assigned inside the same company");
    }

    const duplicateStmt = db.prepare(`
      SELECT id
      FROM quiz_assignments
      WHERE quiz_id = ?
        AND user_id = ?
        AND status IN ('ASSIGNED', 'IN_PROGRESS')
      LIMIT 1
    `);

    const existing = duplicateStmt.get(quizId, Number(userId));
    if (existing) {
      throw new ApiError(409, "An active assignment already exists for this quiz and user");
    }

    const insertStmt = db.prepare(`
      INSERT INTO quiz_assignments (
        quiz_id,
        user_id,
        assigned_by,
        assigned_by,
        assigned_at,
        due_date,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, 'ASSIGNED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const result = insertStmt.run(
      quizId,
      Number(userId),
      req.user.sub,
      dueDate || null
    );

    const createdStmt = db.prepare(`
      SELECT
        id,
        quiz_id AS quizId,
        user_id AS userId,
        assigned_at AS assignedAt,
        due_date AS dueDate,
        status
      FROM quiz_assignments
      WHERE id = ?
    `);

    const assignment = createdStmt.get(result.lastInsertRowid);

    return res.status(201).json({
      message: "Quiz assigned successfully",
      assignment,
    });
  } catch (error) {
    next(error);
  }
}
export function selfAssignQuiz(req, res, next) {
  try {
    const quizId = Number(req.params.quizId);

    const quiz = db.prepare(`
      SELECT id FROM quizzes WHERE id = ? AND is_active = 1
    `).get(quizId);

    if (!quiz) throw new ApiError(404, "Quiz not found");

    const existing = db.prepare(`
      SELECT id FROM quiz_assignments
      WHERE user_id = ? AND quiz_id = ? AND status IN ('ASSIGNED', 'IN_PROGRESS')
    `).get(req.user.sub, quizId);

    if (existing) {
      throw new ApiError(400, "Quiz already assigned");
    }

    const result = db.prepare(`
      INSERT INTO quiz_assignments (
        quiz_id,
        user_id,
        assigned_by,
        assigned_at,
        due_date,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, NULL, 'ASSIGNED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      quizId,
      req.user.sub,
      req.user.sub
    );

    const assignment = db.prepare(`
      SELECT id, user_id AS userId, quiz_id AS quizId, status
      FROM quiz_assignments WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ assignment });
  } catch (error) {
    next(error);
  }
}