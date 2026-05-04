// Assignment controller — handles assigning quizzes to users and retrieving assignment data.
import { db } from "../database/db.js";
import { ApiError } from "../utils/apiError.js";

// GET /api/assignments/me — returns all assignments for the currently logged-in user
export function getMyAssignments(req, res, next) {
  try {
    const rows = db.prepare(`
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
    `).all(req.user.sub);

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/assignments/quizzes/:quizId/self — user assigns themselves to a quiz
export function selfAssignQuiz(req, res, next) {
  try {
    const quizId = Number(req.params.quizId);
    const userId = req.user.sub;

    const quiz = db.prepare(`SELECT id FROM quizzes WHERE id = ? AND is_active = 1`).get(quizId);
    if (!quiz) throw new ApiError(404, "Quiz not found");

    // Prevent assigning the same quiz twice if one is already active
    const existing = db.prepare(`
      SELECT id FROM quiz_assignments
      WHERE user_id = ? AND quiz_id = ? AND status IN ('ASSIGNED', 'IN_PROGRESS')
    `).get(userId, quizId);

    if (existing) throw new ApiError(400, "Quiz already assigned");

    const result = db.prepare(`
      INSERT INTO quiz_assignments (quiz_id, user_id, assigned_by, assigned_at, due_date, status, created_at, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, NULL, 'ASSIGNED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(quizId, userId, userId);

    const assignment = db.prepare(`
      SELECT id, user_id AS userId, quiz_id AS quizId, status
      FROM quiz_assignments WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ assignment });
  } catch (err) {
    next(err);
  }
}

// GET /api/assignments/user/:userId/pending — returns assignments that still need to be completed
export function getUserPendingAssignments(req, res, next) {
  try {
    const userId = Number(req.params.userId);

    const rows = db.prepare(`
      SELECT
        qa.id AS assignmentId,
        qa.status,
        q.id AS quizId,
        q.title AS quizTitle,
        q.description AS quizDescription,
        q.max_wrong_answers AS maxWrongAnswers,
        qa.due_date AS dueDate
      FROM quiz_assignments qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = ? AND qa.status IN ('ASSIGNED', 'IN_PROGRESS')
      ORDER BY qa.assigned_at DESC
    `).all(userId);

    return res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/assignments/company/:companyId/completed
// Returns all completed attempts for a company, with per-question answer details grouped by attempt.
export function getCompanyCompletedAssignments(req, res, next) {
  try {
    const companyId = Number(req.params.companyId);

    if (req.user.role === "Super user" && req.user.companyId !== companyId)
      throw new ApiError(403, "Forbidden");

    const rows = db.prepare(`
      SELECT
        u.email,
        q.title AS quizTitle,
        at2.passed,
        at2.current_score AS score,
        at2.attempt_number AS attemptNumber,
        at2.completed_at AS completedAt,
        at2.time_taken_seconds AS timeTaken,
        at2.id AS attemptId,
        ques.question_text AS questionText,
        qaa.is_correct AS isCorrect,
        qo.option_text AS selectedOption,
        (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) AS totalQuestions
      FROM quiz_attempts at2
      INNER JOIN quiz_assignments qa ON qa.id = at2.assignment_id
      INNER JOIN users u ON u.id = qa.user_id
      INNER JOIN quizzes q ON q.id = qa.quiz_id
      LEFT JOIN quiz_attempt_answers qaa ON qaa.attempt_id = at2.id
      LEFT JOIN questions ques ON ques.id = qaa.question_id
      LEFT JOIN question_options qo ON qo.id = qaa.selected_option_id
      WHERE u.company_id = ? AND at2.status = 'COMPLETED'
      ORDER BY at2.completed_at DESC, at2.id, qaa.question_id
    `).all(companyId);

    // Group flat rows into nested objects keyed by attemptId
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.attemptId]) {
        grouped[row.attemptId] = {
          email: row.email, quizTitle: row.quizTitle, passed: Boolean(row.passed),
          score: row.score, attemptNumber: row.attemptNumber, completedAt: row.completedAt,
          timeTaken: row.timeTaken, totalQuestions: row.totalQuestions, answers: [],
        };
      }

      if (row.questionText) {
        grouped[row.attemptId].answers.push({
          questionText: row.questionText,
          selectedOption: row.selectedOption,
          isCorrect: Boolean(row.isCorrect),
        });
      }
    }

    return res.status(200).json(Object.values(grouped));
  } catch (err) {
    next(err);
  }
}

// POST /api/assignments/quizzes/:quizId — admin or super user assigns a quiz to a specific user
export function createAssignment(req, res, next) {
  try {
    const quizId = Number(req.params.quizId);
    const { userId, dueDate } = req.body;

    if (!userId) throw new ApiError(400, "userId is required");

    const quiz = db.prepare(`
      SELECT id, company_id AS companyId, source_type AS sourceType, is_active AS isActive
      FROM quizzes WHERE id = ?
    `).get(quizId);

    if (!quiz) throw new ApiError(404, "Quiz not found");
    if (!quiz.isActive) throw new ApiError(400, "Quiz is inactive");

    const targetUser = db.prepare(`
      SELECT u.id, u.company_id AS companyId, r.name AS role
      FROM users u INNER JOIN roles r ON r.id = u.role_id WHERE u.id = ?
    `).get(Number(userId));

    if (!targetUser) throw new ApiError(404, "User not found");
    if (targetUser.role !== "User") throw new ApiError(400, "Assignments can only be created for users");

    // Super users can only assign quizzes within their own company
    if (req.user.role === "Super user") {
      if (req.user.companyId !== targetUser.companyId)
        throw new ApiError(403, "You can only assign quizzes to users of your company");
      if (quiz.sourceType === "COMPANY" && quiz.companyId !== req.user.companyId)
        throw new ApiError(403, "You cannot assign another company's quiz");
    }

    if (quiz.sourceType === "COMPANY" && quiz.companyId !== targetUser.companyId)
      throw new ApiError(400, "Company quiz can only be assigned inside the same company");

    // Don't create a duplicate active assignment
    const existing = db.prepare(`
      SELECT id FROM quiz_assignments
      WHERE quiz_id = ? AND user_id = ? AND status IN ('ASSIGNED', 'IN_PROGRESS') LIMIT 1
    `).get(quizId, Number(userId));

    if (existing) throw new ApiError(409, "An active assignment already exists for this quiz and user");

    const result = db.prepare(`
      INSERT INTO quiz_assignments (quiz_id, user_id, assigned_by, assigned_at, due_date, status, created_at, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, 'ASSIGNED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(quizId, Number(userId), req.user.sub, dueDate || null);

    const assignment = db.prepare(`
      SELECT id, quiz_id AS quizId, user_id AS userId, assigned_at AS assignedAt, due_date AS dueDate, status
      FROM quiz_assignments WHERE id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({ message: "Quiz assigned successfully", assignment });
  } catch (error) {
    next(error);
  }
}
