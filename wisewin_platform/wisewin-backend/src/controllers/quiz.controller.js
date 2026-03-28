import { db } from "../database/db.js";
import { ApiError } from "../utils/apiError.js";

export function getVisibleQuizzes(req, res, next) {
  try {
    let quizzes = [];

    if (req.user.role === "Administrator") {
      quizzes = db.prepare(`
        SELECT
          q.id,
          q.title,
          q.description,
          q.source_type AS sourceType,
          q.company_id AS companyId,
          q.created_by AS createdBy,
          q.max_wrong_answers AS maxWrongAnswers,
          q.is_active AS isActive
        FROM quizzes q
        ORDER BY q.id DESC
      `).all();
    } else {
      quizzes = db.prepare(`
        SELECT
          q.id,
          q.title,
          q.description,
          q.source_type AS sourceType,
          q.company_id AS companyId,
          q.created_by AS createdBy,
          q.max_wrong_answers AS maxWrongAnswers,
          q.is_active AS isActive
        FROM quizzes q
        WHERE q.company_id IS NULL OR q.company_id = ?
        ORDER BY q.id DESC
      `).all(req.user.companyId);
    }

    res.status(200).json(quizzes);
  } catch (error) {
    next(error);
  }
}

export function createQuiz(req, res, next) {
  try {
    const { title, description, sourceType, maxWrongAnswers } = req.body;

    if (!title || !sourceType) {
      throw new ApiError(400, "title and sourceType are required");
    }

    if (!["PLATFORM", "COMPANY"].includes(sourceType)) {
      throw new ApiError(400, "Invalid sourceType");
    }

    if (req.user.role === "Super user" && sourceType !== "COMPANY") {
      throw new ApiError(403, "Super user can only create company quizzes");
    }

    const companyId =
      sourceType === "COMPANY"
        ? req.user.role === "Super user"
          ? req.user.companyId
          : req.body.companyId ?? null
        : null;

    if (sourceType === "COMPANY" && !companyId) {
      throw new ApiError(400, "companyId is required for company quiz");
    }

    const result = db.prepare(`
      INSERT INTO quizzes (
        company_id,
        created_by,
        title,
        description,
        source_type,
        max_wrong_answers,
        is_active,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      companyId,
      req.user.sub,
      title,
      description || null,
      sourceType,
      Number(maxWrongAnswers ?? 2)
    );

    const quiz = db.prepare(`
      SELECT
        id,
        company_id AS companyId,
        created_by AS createdBy,
        title,
        description,
        source_type AS sourceType,
        max_wrong_answers AS maxWrongAnswers,
        is_active AS isActive
      FROM quizzes
      WHERE id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    next(error);
  }
}