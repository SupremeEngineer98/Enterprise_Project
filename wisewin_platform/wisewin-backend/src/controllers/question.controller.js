import { db } from "../database/db.js";
import { ApiError } from "../utils/apiError.js";

export function createQuestion(req, res, next) {
  try {
    const quizId = Number(req.params.quizId);
    const { questionText, displayOrder, options } = req.body;

    if (!questionText || !Array.isArray(options) || options.length < 2) {
      throw new ApiError(400, "questionText and at least 2 options are required");
    }

    const correctOptions = options.filter((opt) => opt.isCorrect === true);
    if (correctOptions.length !== 1) {
      throw new ApiError(400, "Exactly one correct option is required");
    }

    const quiz = db.prepare(`
      SELECT
        id,
        company_id AS companyId,
        source_type AS sourceType,
        created_by AS createdBy
      FROM quizzes
      WHERE id = ?
    `).get(quizId);

    if (!quiz) {
      throw new ApiError(404, "Quiz not found");
    }

    if (req.user.role === "Super user") {
      if (quiz.sourceType !== "COMPANY" || quiz.companyId !== req.user.companyId) {
        throw new ApiError(403, "You cannot edit this quiz");
      }
    }

    const transaction = db.transaction(() => {
      const resolvedOrder =
        displayOrder ??
        db.prepare(`SELECT COALESCE(MAX(display_order), 0) + 1 AS nextOrder FROM questions WHERE quiz_id = ?`)
          .get(quizId).nextOrder;

      const questionResult = db.prepare(`
        INSERT INTO questions (
          quiz_id,
          question_text,
          display_order,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(quizId, questionText, resolvedOrder);

      const questionId = questionResult.lastInsertRowid;

      const optionStmt = db.prepare(`
        INSERT INTO question_options (
          question_id,
          option_text,
          is_correct,
          display_order
        )
        VALUES (?, ?, ?, ?)
      `);

      options.forEach((option, index) => {
        if (!option.optionText) {
          throw new ApiError(400, "Each option must have optionText");
        }

        optionStmt.run(
          questionId,
          option.optionText,
          option.isCorrect ? 1 : 0,
          option.displayOrder ?? index + 1
        );
      });

      return questionId;
    });

    const questionId = transaction();

    const createdQuestion = db.prepare(`
      SELECT
        q.id,
        q.quiz_id AS quizId,
        q.question_text AS questionText,
        q.display_order AS displayOrder
      FROM questions q
      WHERE q.id = ?
    `).get(questionId);

    const createdOptions = db.prepare(`
      SELECT
        id,
        option_text AS optionText,
        is_correct AS isCorrect,
        display_order AS displayOrder
      FROM question_options
      WHERE question_id = ?
      ORDER BY display_order ASC
    `).all(questionId);

    return res.status(201).json({
      message: "Question created successfully",
      question: {
        ...createdQuestion,
        options: createdOptions.map((opt) => ({
          ...opt,
          isCorrect: Boolean(opt.isCorrect),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

export function getQuizQuestions(req, res, next) {
  try {
    const quizId = Number(req.params.quizId);

    const quiz = db.prepare(`
      SELECT
        id,
        company_id AS companyId,
        source_type AS sourceType
      FROM quizzes
      WHERE id = ?
    `).get(quizId);

    if (!quiz) {
      throw new ApiError(404, "Quiz not found");
    }

    if (req.user.role === "Super user") {
      if (quiz.sourceType === "COMPANY" && quiz.companyId !== req.user.companyId) {
        throw new ApiError(403, "Forbidden");
      }
    }

    if (req.user.role === "User") {
      if (quiz.sourceType === "COMPANY" && quiz.companyId !== req.user.companyId) {
        throw new ApiError(403, "Forbidden");
      }
    }

    const questions = db.prepare(`
      SELECT
        id,
        question_text AS questionText,
        display_order AS displayOrder
      FROM questions
      WHERE quiz_id = ?
      ORDER BY display_order ASC
    `).all(quizId);

    const optionsStmt = db.prepare(`
      SELECT
        id,
        option_text AS optionText,
        is_correct AS isCorrect,
        display_order AS displayOrder
      FROM question_options
      WHERE question_id = ?
      ORDER BY display_order ASC
    `);

    const result = questions.map((question) => ({
      ...question,
      options: optionsStmt.all(question.id).map((opt) => ({
        ...opt,
        isCorrect: Boolean(opt.isCorrect),
      })),
    }));

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}