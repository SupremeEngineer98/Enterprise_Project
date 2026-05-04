// Attempt controller — manages quiz attempts (starting, answering questions, and submitting).
// One assignment can have multiple attempts if the user fails and tries again.
import { db } from "../database/db.js";
import { ApiError } from "../utils/apiError.js";
import { shuffleArray } from "../utils/shuffle.js";

// POST /api/attempts/assignments/:assignmentId/start
// Creates a new attempt for an assignment, or returns the existing one if it's already in progress.
export function startAttempt(req, res, next) {
  try {
    const assignmentId = Number(req.params.assignmentId);

    const assignment = db.prepare(`
      SELECT qa.id, qa.user_id AS userId, qa.status, qa.due_date AS dueDate
      FROM quiz_assignments qa WHERE qa.id = ?
    `).get(assignmentId);

    if (!assignment) throw new ApiError(404, "Assignment not found");
    if (assignment.userId !== req.user.sub) throw new ApiError(403, "Forbidden");
    if (assignment.status === "COMPLETED") throw new ApiError(400, "Assignment already completed");
    if (assignment.dueDate && new Date(assignment.dueDate) < new Date())
      throw new ApiError(400, "Assignment is overdue");

    // Figure out what attempt number this would be
    const { totalAttempts } = db.prepare(`SELECT COUNT(*) AS totalAttempts FROM quiz_attempts WHERE assignment_id = ?`).get(assignmentId);
    const nextAttemptNumber = totalAttempts + 1;

    // If there's already an in-progress attempt, return it instead of creating a new one
    const existingAttempt = db.prepare(`
      SELECT id, assignment_id AS assignmentId, status, started_at AS startedAt
      FROM quiz_attempts WHERE assignment_id = ? AND status = 'IN_PROGRESS' LIMIT 1
    `).get(assignmentId);

    if (existingAttempt) {
      return res.status(200).json({
        attemptId: existingAttempt.id,
        assignmentId: existingAttempt.assignmentId,
        status: existingAttempt.status,
        startedAt: existingAttempt.startedAt,
      });
    }

    // Create a fresh attempt and mark the assignment as in progress
    const result = db.prepare(`
      INSERT INTO quiz_attempts (assignment_id, attempt_number, status, current_score, answered_count, passed, started_at, last_activity_at)
      VALUES (?, ?, 'IN_PROGRESS', 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(assignmentId, nextAttemptNumber);

    db.prepare(`UPDATE quiz_assignments SET status = 'IN_PROGRESS', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(assignmentId);

    const attempt = db.prepare(`
      SELECT id AS attemptId, assignment_id AS assignmentId, attempt_number AS attemptNumber, status, started_at AS startedAt
      FROM quiz_attempts WHERE id = ?
    `).get(result.lastInsertRowid);

    return res.status(200).json(attempt);
  } catch (error) {
    next(error);
  }
}

// GET /api/attempts/:attemptId
// Returns the current state of an attempt, including the next unanswered question (in random order).
export function getAttemptById(req, res, next) {
  try {
    const attemptId = Number(req.params.attemptId);

    const attempt = db.prepare(`
      SELECT qa2.id AS attemptId, qa2.assignment_id AS assignmentId, qa2.status,
             qa2.current_score AS currentScore, qa2.answered_count AS answeredCount, q.id AS quizId
      FROM quiz_attempts qa2
      INNER JOIN quiz_assignments qa ON qa.id = qa2.assignment_id
      INNER JOIN quizzes q ON q.id = qa.quiz_id
      WHERE qa2.id = ?
    `).get(attemptId);

    if (!attempt) throw new ApiError(404, "Attempt not found");

    const ownership = db.prepare(`
      SELECT qa.user_id AS userId FROM quiz_attempts a
      INNER JOIN quiz_assignments qa ON qa.id = a.assignment_id WHERE a.id = ?
    `).get(attemptId);

    if (req.user.role === "User" && ownership.userId !== req.user.sub) throw new ApiError(403, "Forbidden");

    const { totalQuestions } = db.prepare(`SELECT COUNT(*) AS totalQuestions FROM questions WHERE quiz_id = ?`).get(attempt.quizId);

    // Pick a random question that the user hasn't answered yet
    const nextQuestion = db.prepare(`
      SELECT q.id, q.question_text AS questionText, q.display_order AS displayOrder
      FROM questions q
      WHERE q.quiz_id = ? AND q.id NOT IN (
        SELECT question_id FROM quiz_attempt_answers WHERE attempt_id = ?
      )
      ORDER BY RANDOM() LIMIT 1
    `).get(attempt.quizId, attemptId);

    let fullNextQuestion = null;

    if (nextQuestion) {
      // Attach shuffled answer options so they appear in a different order each time
      const options = db.prepare(`
        SELECT id, option_text AS optionText FROM question_options WHERE question_id = ? ORDER BY display_order ASC
      `).all(nextQuestion.id);

      fullNextQuestion = { ...nextQuestion, options: shuffleArray(options) };
    }

    return res.status(200).json({
      attemptId: attempt.attemptId,
      assignmentId: attempt.assignmentId,
      status: attempt.status,
      currentScore: attempt.currentScore,
      answeredCount: attempt.answeredCount,
      totalQuestions,
      nextQuestion: fullNextQuestion,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/attempts/:attemptId/answers — records the user's answer to a single question
export function submitAnswer(req, res, next) {
  try {
    const attemptId = Number(req.params.attemptId);
    const { questionId, selectedOptionId } = req.body;

    if (!questionId || !selectedOptionId) throw new ApiError(400, "questionId and selectedOptionId are required");

    const attempt = db.prepare(`
      SELECT a.id, a.status, qa.user_id AS userId
      FROM quiz_attempts a INNER JOIN quiz_assignments qa ON qa.id = a.assignment_id WHERE a.id = ?
    `).get(attemptId);

    if (!attempt) throw new ApiError(404, "Attempt not found");
    if (attempt.userId !== req.user.sub) throw new ApiError(403, "Forbidden");
    if (attempt.status !== "IN_PROGRESS") throw new ApiError(400, "Attempt is not active");

    // Reject duplicate answers for the same question
    if (db.prepare(`SELECT id FROM quiz_attempt_answers WHERE attempt_id = ? AND question_id = ?`).get(attemptId, questionId))
      throw new ApiError(409, "Question already answered");

    const option = db.prepare(`SELECT is_correct AS isCorrect FROM question_options WHERE id = ? AND question_id = ?`).get(selectedOptionId, questionId);
    if (!option) throw new ApiError(400, "Invalid option");

    const isCorrect = option.isCorrect ? 1 : 0;

    // Save the answer and update the running score
    db.prepare(`
      INSERT INTO quiz_attempt_answers (attempt_id, question_id, selected_option_id, is_correct, answered_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(attemptId, questionId, selectedOptionId, isCorrect);

    db.prepare(`
      UPDATE quiz_attempts SET current_score = current_score + ?, answered_count = answered_count + 1, last_activity_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(isCorrect, attemptId);

    const updatedAttempt = db.prepare(`SELECT id AS attemptId, current_score AS currentScore, answered_count AS answeredCount FROM quiz_attempts WHERE id = ?`).get(attemptId);

    return res.status(200).json({
      isCorrect: Boolean(isCorrect),
      message: isCorrect ? "Correct! Well done." : "Incorrect. Keep going.",
      ...updatedAttempt,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/attempts/:attemptId/submit — finalises the attempt after all questions are answered.
// Calculates whether the user passed based on the quiz's maxWrongAnswers rule.
export function submitAttempt(req, res, next) {
  try {
    const attemptId = Number(req.params.attemptId);
    const timeTaken = Math.max(0, Number(req.body?.timeTaken || 0));

    const attempt = db.prepare(`
      SELECT a.id, a.assignment_id AS assignmentId, a.status, a.current_score AS currentScore,
             a.answered_count AS answeredCount, a.attempt_number AS attemptNumber,
             qa.user_id AS userId, qa.quiz_id AS quizId
      FROM quiz_attempts a INNER JOIN quiz_assignments qa ON qa.id = a.assignment_id WHERE a.id = ?
    `).get(attemptId);

    if (!attempt) throw new ApiError(404, "Attempt not found");
    if (attempt.userId !== req.user.sub) throw new ApiError(403, "Forbidden");
    if (attempt.status !== "IN_PROGRESS") throw new ApiError(400, "Attempt is not active");

    const quizRules = db.prepare(`
      SELECT q.max_wrong_answers AS maxWrongAnswers, COUNT(ques.id) AS totalQuestions
      FROM quizzes q LEFT JOIN questions ques ON ques.quiz_id = q.id WHERE q.id = ?
    `).get(attempt.quizId);

    const { totalQuestions, maxWrongAnswers } = quizRules;

    if (attempt.answeredCount < totalQuestions)
      throw new ApiError(400, "You must answer all questions before submitting");

    // Pass if the number of wrong answers is within the allowed limit
    const wrongAnswers = totalQuestions - attempt.currentScore;
    const passed = wrongAnswers <= maxWrongAnswers ? 1 : 0;

    db.prepare(`
      UPDATE quiz_attempts SET status = 'COMPLETED', passed = ?, time_taken_seconds = ?,
      completed_at = CURRENT_TIMESTAMP, last_activity_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(passed, timeTaken, attemptId);

    // If passed, mark the assignment as done; if failed, reset it to ASSIGNED so they can try again
    db.prepare(`UPDATE quiz_assignments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(passed ? "COMPLETED" : "ASSIGNED", attempt.assignmentId);

    const answers = db.prepare(`
      SELECT q.question_text AS questionText, qaa.is_correct AS isCorrect, qo.option_text AS selectedOption
      FROM quiz_attempt_answers qaa
      INNER JOIN questions q ON q.id = qaa.question_id
      INNER JOIN question_options qo ON qo.id = qaa.selected_option_id
      WHERE qaa.attempt_id = ?
    `).all(attemptId);

    return res.status(200).json({
      status: "COMPLETED",
      attemptNumber: attempt.attemptNumber,
      finalScore: attempt.currentScore,
      totalQuestions, wrongAnswers, maxWrongAnswers,
      passed: Boolean(passed),
      completedAt: new Date().toISOString(),
      timeTaken, answers,
      message: passed ? "Quiz passed successfully." : "Quiz failed. Please try again.",
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/attempts/assignments/:assignmentId/history
// Returns all attempts for an assignment, each with its per-question answers grouped together.
export function getAssignmentAttempts(req, res, next) {
  try {
    const assignmentId = Number(req.params.assignmentId);

    const assignment = db.prepare(`SELECT qa.id, qa.user_id AS userId, qa.quiz_id AS quizId FROM quiz_assignments qa WHERE qa.id = ?`).get(assignmentId);
    if (!assignment) throw new ApiError(404, "Assignment not found");

    if (req.user.role === "User" && assignment.userId !== req.user.sub) throw new ApiError(403, "Forbidden");

    const { totalQuestions } = db.prepare(`SELECT COUNT(*) AS totalQuestions FROM questions WHERE quiz_id = ?`).get(assignment.quizId);

    const rows = db.prepare(`
      SELECT
        qa.id AS attemptId, qa.attempt_number AS attemptNumber, qa.status,
        qa.current_score AS score, qa.passed, qa.started_at AS startedAt,
        qa.completed_at AS completedAt, q.question_text AS questionText,
        qaa.is_correct AS isCorrect, qo.option_text AS selectedOption, qa.time_taken_seconds AS timeTaken
      FROM quiz_attempts qa
      LEFT JOIN quiz_attempt_answers qaa ON qaa.attempt_id = qa.id
      LEFT JOIN questions q ON q.id = qaa.question_id
      LEFT JOIN question_options qo ON qo.id = qaa.selected_option_id
      WHERE qa.assignment_id = ? ORDER BY qa.attempt_number ASC
    `).all(assignmentId);

    // Group flat rows into an attempt-per-object structure with answers nested inside
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.attemptId]) {
        grouped[row.attemptId] = {
          attemptId: row.attemptId, attemptNumber: row.attemptNumber, status: row.status,
          score: row.score, passed: row.passed === null ? null : Boolean(row.passed),
          startedAt: row.startedAt, completedAt: row.completedAt, totalQuestions,
          timeTaken: row.timeTaken, answers: [],
        };
      }

      if (row.questionText) {
        grouped[row.attemptId].answers.push({
          questionText: row.questionText, isCorrect: Boolean(row.isCorrect), selectedOption: row.selectedOption,
        });
      }
    }

    return res.status(200).json(Object.values(grouped));
  } catch (error) {
    next(error);
  }
}
