import { db } from "../database/db.js";
import { ApiError } from "../utils/apiError.js";

// =========================
// GET MY ASSIGNMENTS
// =========================
export function getMyAssignments(req, res, next) {
  try {
    const stmt = db.prepare(`
      SELECT
        qa.id AS assignmentId,
        qa.quiz_id AS quizId,
        q.title AS quizTitle,
        qa.status,
        qa.due_date AS dueDate
      FROM quiz_assignments qa
      JOIN quizzes q ON q.id = qa.quiz_id
      WHERE qa.user_id = ?
      ORDER BY qa.id DESC
    `);

    const rows = stmt.all(req.user.sub);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// =========================
// SELF ASSIGN QUIZ
// =========================
export function selfAssignQuiz(req, res, next) {
  try {
    const quizId = Number(req.params.quizId);
    const userId = req.user.sub;

    const quiz = db.prepare(`
      SELECT id FROM quizzes WHERE id = ? AND is_active = 1
    `).get(quizId);

    if (!quiz) throw new ApiError(404, "Quiz not found");

    const existing = db.prepare(`
      SELECT id FROM quiz_assignments
      WHERE user_id = ? AND quiz_id = ? AND status IN ('ASSIGNED', 'IN_PROGRESS')
    `).get(userId, quizId);

    if (existing) throw new ApiError(400, "Quiz already assigned");

    const result = db.prepare(`
      INSERT INTO quiz_assignments (
        quiz_id, user_id, assigned_by,
        assigned_at, due_date, status,
        created_at, updated_at
      )
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, NULL, 'ASSIGNED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(quizId, userId, userId);

    const assignment = db.prepare(`
      SELECT id, user_id AS userId, quiz_id AS quizId, status
      FROM quiz_assignments
      WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ assignment });

  } catch (err) {
    next(err);
  }
}

// =========================
// COMPANY COMPLETED (stub για να μην σκάει)
// =========================
export function getCompanyCompletedAssignments(req, res, next) {
  try {
    const companyId = Number(req.params.companyId);

    const rows = db.prepare(`
      SELECT *
      FROM quiz_assignments
      WHERE status = 'COMPLETED'
    `).all();

    res.json(rows);
  } catch (err) {
    next(err);
  }
}