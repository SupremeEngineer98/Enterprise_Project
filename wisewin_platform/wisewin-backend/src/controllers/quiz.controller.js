// Quiz controller — handles creating, reading, updating, and deleting quizzes.
// Admins see all quizzes; Super users and regular Users only see quizzes for their company
// plus platform-wide quizzes (where company_id is NULL).
import { db } from "../database/db.js";
import { ApiError } from "../utils/apiError.js";

// GET /api/quizzes — returns all quizzes the logged-in user is allowed to see
export function getVisibleQuizzes(req, res, next) {
  try {
    let quizzes = [];

    if (req.user.role === "Administrator") {
      quizzes = db.prepare(`
        SELECT q.id, q.title, q.description, q.source_type AS sourceType,
               q.company_id AS companyId, q.created_by AS createdBy,
               q.max_wrong_answers AS maxWrongAnswers, q.is_active AS isActive
        FROM quizzes q ORDER BY q.id DESC
      `).all();
    } else {
      // Non-admins can only see global quizzes (company_id IS NULL) or their own company's quizzes
      quizzes = db.prepare(`
        SELECT q.id, q.title, q.description, q.source_type AS sourceType,
               q.company_id AS companyId, q.created_by AS createdBy,
               q.max_wrong_answers AS maxWrongAnswers, q.is_active AS isActive
        FROM quizzes q WHERE q.company_id IS NULL OR q.company_id = ?
        ORDER BY q.id DESC
      `).all(req.user.companyId);
    }

    res.status(200).json(quizzes);
  } catch (error) {
    next(error);
  }
}

// POST /api/quizzes — creates a new quiz.
// sourceType must be "PLATFORM" (admin only) or "COMPANY" (admin or super user).
export function createQuiz(req, res, next) {
  try {
    const { title, description, sourceType, maxWrongAnswers } = req.body;

    if (!title || !sourceType) throw new ApiError(400, "title and sourceType are required");
    if (!["PLATFORM", "COMPANY"].includes(sourceType)) throw new ApiError(400, "Invalid sourceType");
    if (req.user.role === "Super user" && sourceType !== "COMPANY")
      throw new ApiError(403, "Super user can only create company quizzes");

    // Determine which company the quiz belongs to
    const companyId = sourceType === "COMPANY"
      ? req.user.role === "Super user" ? req.user.companyId : req.body.companyId ?? null
      : null;

    if (sourceType === "COMPANY" && !companyId)
      throw new ApiError(400, "companyId is required for company quiz");

    const result = db.prepare(`
      INSERT INTO quizzes (company_id, created_by, title, description, source_type, max_wrong_answers, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(companyId, req.user.sub, title, description || null, sourceType, Number(maxWrongAnswers ?? 2));

    const quiz = db.prepare(`
      SELECT id, company_id AS companyId, created_by AS createdBy, title, description,
             source_type AS sourceType, max_wrong_answers AS maxWrongAnswers, is_active AS isActive
      FROM quizzes WHERE id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (error) {
    next(error);
  }
}

// PUT /api/quizzes/:quizId — updates quiz fields (only sends the ones that changed)
export function updateQuiz(req, res, next) {
  try {
    const quizId = Number(req.params.quizId);
    const { title, description, maxWrongAnswers, isActive } = req.body;

    const quiz = db.prepare(`SELECT id, company_id AS companyId, source_type AS sourceType FROM quizzes WHERE id = ?`).get(quizId);
    if (!quiz) throw new ApiError(404, "Quiz not found");

    // Super users can only edit their own company's quizzes
    if (req.user.role === "Super user") {
      if (quiz.sourceType !== "COMPANY" || quiz.companyId !== req.user.companyId)
        throw new ApiError(403, "You cannot edit this quiz");
    }

    db.prepare(`
      UPDATE quizzes SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        max_wrong_answers = COALESCE(?, max_wrong_answers),
        is_active = CASE WHEN ? IS NOT NULL THEN ? ELSE is_active END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title ?? null, description ?? null, maxWrongAnswers ?? null,
      isActive !== undefined ? 1 : null, isActive ? 1 : 0, quizId
    );

    const updated = db.prepare(`
      SELECT id, company_id AS companyId, title, description,
             source_type AS sourceType, max_wrong_answers AS maxWrongAnswers, is_active AS isActive
      FROM quizzes WHERE id = ?
    `).get(quizId);

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/quizzes/:quizId
export function deleteQuiz(req, res, next) {
  try {
    const quizId = Number(req.params.quizId);

    const quiz = db.prepare(`SELECT id, company_id AS companyId, source_type AS sourceType FROM quizzes WHERE id = ?`).get(quizId);
    if (!quiz) throw new ApiError(404, "Quiz not found");

    if (req.user.role === "Super user") {
      if (quiz.sourceType !== "COMPANY" || quiz.companyId !== req.user.companyId)
        throw new ApiError(403, "You cannot delete this quiz");
    }

    db.prepare(`DELETE FROM quizzes WHERE id = ?`).run(quizId);
    return res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    next(error);
  }
}

// POST /api/assignments/quizzes/:quizId/self
// Lets a regular user assign themselves to a quiz without needing an admin to do it.
export function selfAssignQuiz(req, res, next) {
  try {
    const quizId = Number(req.params.quizId);

    const quiz = db.prepare(`SELECT id FROM quizzes WHERE id = ? AND is_active = 1`).get(quizId);
    if (!quiz) throw new ApiError(404, "Quiz not found");

    // Don't create a duplicate assignment if one is already active
    const existing = db.prepare(`
      SELECT id FROM assignments
      WHERE user_id = ? AND quiz_id = ? AND status IN ('ASSIGNED', 'IN_PROGRESS')
    `).get(req.user.sub, quizId);

    if (existing) throw new ApiError(400, "Quiz already assigned");

    const result = db.prepare(`
      INSERT INTO assignments (user_id, quiz_id, status, attempts_used, created_at)
      VALUES (?, ?, 'ASSIGNED', 0, CURRENT_TIMESTAMP)
    `).run(req.user.sub, quizId);

    const assignment = db.prepare(`
      SELECT id, user_id AS userId, quiz_id AS quizId, status
      FROM assignments WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ assignment });
  } catch (error) {
    next(error);
  }
}
