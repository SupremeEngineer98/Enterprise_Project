import { db } from "../database/db.js";
import { ApiError } from "../utils/apiError.js";
import { shuffleArray } from "../utils/shuffle.js";

export function startAttempt(req, res, next) {
  try {
    const assignmentId = Number(req.params.assignmentId);

    const assignmentStmt = db.prepare(`
      SELECT
        qa.id,
        qa.user_id AS userId,
        qa.status,
        qa.due_date AS dueDate
      FROM quiz_assignments qa
      WHERE qa.id = ?
    `);

    const assignment = assignmentStmt.get(assignmentId);

    if (!assignment) {
      throw new ApiError(404, "Assignment not found");
    }

    if (assignment.userId !== req.user.sub) {
      throw new ApiError(403, "Forbidden");
    }

    if (assignment.status === "COMPLETED") {
      throw new ApiError(400, "Assignment already completed");
    }

    if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
      throw new ApiError(400, "Assignment is overdue");
    }

    const countStmt = db.prepare(`
      SELECT COUNT(*) AS totalAttempts
      FROM quiz_attempts
      WHERE assignment_id = ?
    `);
      
    const { totalAttempts } = countStmt.get(assignmentId);
    const nextAttemptNumber = totalAttempts + 1;

    const existingStmt = db.prepare(`
      SELECT
        id,
        assignment_id AS assignmentId,
        status,
        started_at AS startedAt
      FROM quiz_attempts
      WHERE assignment_id = ?
        AND status = 'IN_PROGRESS'
      LIMIT 1
    `);

    const existingAttempt = existingStmt.get(assignmentId);

    if (existingAttempt) {
      return res.status(200).json({
        attemptId: existingAttempt.id,
        assignmentId: existingAttempt.assignmentId,
        status: existingAttempt.status,
        startedAt: existingAttempt.startedAt,
      });
    }

    const insertStmt = db.prepare(`
      INSERT INTO quiz_attempts (
        assignment_id,
        attempt_number,
        status,
        current_score,
        answered_count,
        passed,
        started_at,
        last_activity_at
      )
      VALUES (?, ?, 'IN_PROGRESS', 0, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const result = insertStmt.run(assignmentId, nextAttemptNumber);

    const updateAssignmentStmt = db.prepare(`
      UPDATE quiz_assignments
      SET status = 'IN_PROGRESS',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateAssignmentStmt.run(assignmentId);

    const createdStmt = db.prepare(`
      SELECT
        id AS attemptId,
        assignment_id AS assignmentId,
        attempt_number AS attemptNumber,
        status,
        started_at AS startedAt
      FROM quiz_attempts
      WHERE id = ?
    `);

    const attempt = createdStmt.get(result.lastInsertRowid);

    return res.status(200).json(attempt);
  } catch (error) {
    next(error);
  }
}

export function getAttemptById(req, res, next) {
  try {
    const attemptId = Number(req.params.attemptId);

    const attemptStmt = db.prepare(`
      SELECT
        qa2.id AS attemptId,
        qa2.assignment_id AS assignmentId,
        qa2.status,
        qa2.current_score AS currentScore,
        qa2.answered_count AS answeredCount,
        q.id AS quizId
      FROM quiz_attempts qa2
      INNER JOIN quiz_assignments qa ON qa.id = qa2.assignment_id
      INNER JOIN quizzes q ON q.id = qa.quiz_id
      WHERE qa2.id = ?
    `);

    const attempt = attemptStmt.get(attemptId);

    if (!attempt) {
      throw new ApiError(404, "Attempt not found");
    }

    const ownershipStmt = db.prepare(`
      SELECT
        qa.user_id AS userId
      FROM quiz_attempts a
      INNER JOIN quiz_assignments qa ON qa.id = a.assignment_id
      WHERE a.id = ?
    `);

    const ownership = ownershipStmt.get(attemptId);

    if (req.user.role === "User" && ownership.userId !== req.user.sub) {
      throw new ApiError(403, "Forbidden");
    }

    const totalQuestionsStmt = db.prepare(`
      SELECT COUNT(*) AS totalQuestions
      FROM questions
      WHERE quiz_id = ?
    `);

    const { totalQuestions } = totalQuestionsStmt.get(attempt.quizId);

    const nextQuestionStmt = db.prepare(`
      SELECT
        q.id,
        q.question_text AS questionText,
        q.display_order AS displayOrder
      FROM questions q
      WHERE q.quiz_id = ?
        AND q.id NOT IN (
          SELECT question_id
          FROM quiz_attempt_answers
          WHERE attempt_id = ?
        )
      ORDER BY q.display_order ASC
      LIMIT 1
    `);

    const nextQuestion = nextQuestionStmt.get(attempt.quizId, attemptId);

    let fullNextQuestion = null;
    
    if (nextQuestion) {
      const optionsStmt = db.prepare(`
        SELECT
        id,
        option_text AS optionText
        FROM question_options
        WHERE question_id = ?
        ORDER BY display_order ASC
        `);
        
        const options = optionsStmt.all(nextQuestion.id);
        const shuffledOptions = shuffleArray(options);
        
        fullNextQuestion = {
          ...nextQuestion,
          options: shuffledOptions,
        };
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

export function submitAnswer(req, res, next) {
  try {
    const attemptId = Number(req.params.attemptId);
    const { questionId, selectedOptionId } = req.body;
    

    if (!questionId || !selectedOptionId) {
      throw new ApiError(400, "questionId and selectedOptionId are required");
    }

    const attemptStmt = db.prepare(`
      SELECT
        a.id,
        a.status,
        qa.user_id AS userId
      FROM quiz_attempts a
      INNER JOIN quiz_assignments qa ON qa.id = a.assignment_id
      WHERE a.id = ?
    `);

    const attempt = attemptStmt.get(attemptId);

    if (!attempt) {
      throw new ApiError(404, "Attempt not found");
    }

    if (attempt.userId !== req.user.sub) {
      throw new ApiError(403, "Forbidden");
    }

    if (attempt.status !== "IN_PROGRESS") {
      throw new ApiError(400, "Attempt is not active");
    }

    const existingStmt = db.prepare(`
      SELECT id
      FROM quiz_attempt_answers
      WHERE attempt_id = ? AND question_id = ?
    `);

    if (existingStmt.get(attemptId, questionId)) {
      throw new ApiError(409, "Question already answered");
    }

    const optionStmt = db.prepare(`
      SELECT is_correct AS isCorrect
      FROM question_options
      WHERE id = ? AND question_id = ?
    `);

    const option = optionStmt.get(selectedOptionId, questionId);

    if (!option) {
      throw new ApiError(400, "Invalid option");
    }

    const isCorrect = option.isCorrect ? 1 : 0;

    db.prepare(`
      INSERT INTO quiz_attempt_answers (
        attempt_id,
        question_id,
        selected_option_id,
        is_correct,
        answered_at
      )
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(attemptId, questionId, selectedOptionId, isCorrect);

    db.prepare(`
      UPDATE quiz_attempts
      SET
        current_score = current_score + ?,
        answered_count = answered_count + 1,
        last_activity_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(isCorrect, attemptId);

    const updatedAttempt = db.prepare(`
      SELECT
        id AS attemptId,
        current_score AS currentScore,
        answered_count AS answeredCount
      FROM quiz_attempts
      WHERE id = ?
    `).get(attemptId);

    return res.status(200).json({
      isCorrect: Boolean(isCorrect),
      message: isCorrect ? "Correct! Well done." : "Incorrect. Keep going.",
      ...updatedAttempt,
    });
  } catch (error) {
    next(error);
  }
}

export function submitAttempt(req, res, next) {
  try {
    
    const attemptId = Number(req.params.attemptId);

    const timeTaken = Math.max(0, Number(req.body?.timeTaken || 0)); //adding the time parameter to send it to the DB!

    const attemptStmt = db.prepare(`
      SELECT
        a.id,
        a.assignment_id AS assignmentId,
        a.status,
        a.current_score AS currentScore,
        a.answered_count AS answeredCount,
        a.attempt_number AS attemptNumber,
        qa.user_id AS userId,
        qa.quiz_id AS quizId
      FROM quiz_attempts a
      INNER JOIN quiz_assignments qa ON qa.id = a.assignment_id
      WHERE a.id = ?
    `);

    const attempt = attemptStmt.get(attemptId);

    if (!attempt) {
      throw new ApiError(404, "Attempt not found");
    }

    if (attempt.userId !== req.user.sub) {
      throw new ApiError(403, "Forbidden");
    }

    if (attempt.status !== "IN_PROGRESS") {
      throw new ApiError(400, "Attempt is not active");
    }

    const quizRulesStmt = db.prepare(`
      SELECT
        q.max_wrong_answers AS maxWrongAnswers,
        COUNT(ques.id) AS totalQuestions
      FROM quizzes q
      LEFT JOIN questions ques ON ques.quiz_id = q.id
      WHERE q.id = ?
    `);

    const quizRules = quizRulesStmt.get(attempt.quizId);

    const totalQuestions = quizRules.totalQuestions;
    const maxWrongAnswers = quizRules.maxWrongAnswers;

    if (attempt.answeredCount < totalQuestions) {
      throw new ApiError(400, "You must answer all questions before submitting");
    }

    const wrongAnswers = totalQuestions - attempt.currentScore;
    const passed = wrongAnswers <= maxWrongAnswers ? 1 : 0;

    db.prepare(`
      UPDATE quiz_attempts
      SET
        status = 'COMPLETED',
        passed = ?,
        completed_at = CURRENT_TIMESTAMP,
         time_taken_seconds = ?,
        last_activity_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(passed, timeTaken ?? 0, attemptId);

    if (passed) {
      db.prepare(`
        UPDATE quiz_assignments
        SET
          status = 'COMPLETED',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(attempt.assignmentId);
    } else {
      db.prepare(`
        UPDATE quiz_assignments
        SET
          status = 'ASSIGNED',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(attempt.assignmentId);
    }

    return res.status(200).json({
      status: "COMPLETED",
      attemptNumber: attempt.attemptNumber,
      finalScore: attempt.currentScore,
      totalQuestions,
      wrongAnswers,
      maxWrongAnswers,
      passed: Boolean(passed),
      completedAt: new Date().toISOString(),
      timeTaken: timeTaken,
      message: passed
        ? "Quiz passed successfully."
        : "Quiz failed. Please try again.",
    });
    
  } catch (error) {
    next(error);
  }
 
}

export function getAssignmentAttempts(req, res, next) {
  try {
    const assignmentId = Number(req.params.assignmentId);

    const assignmentStmt = db.prepare(`
      SELECT
        qa.id,
        qa.user_id AS userId,
        qa.quiz_id AS quizId
      FROM quiz_assignments qa
      WHERE qa.id = ?
    `);

    const assignment = assignmentStmt.get(assignmentId);

    if (!assignment) {
      throw new ApiError(404, "Assignment not found");
    }

    if (req.user.role === "User" && assignment.userId !== req.user.sub) {
      throw new ApiError(403, "Forbidden");
    }

    const totalQuestionsStmt = db.prepare(`
      SELECT COUNT(*) AS totalQuestions
      FROM questions
      WHERE quiz_id = ?
    `);

    const { totalQuestions } = totalQuestionsStmt.get(assignment.quizId);

    const attemptsStmt = db.prepare(`
      SELECT
        id AS attemptId,
        attempt_number AS attemptNumber,
        status,
        current_score AS score,
        passed,
        started_at AS startedAt,
        completed_at AS completedAt
      FROM quiz_attempts
      WHERE assignment_id = ?
      ORDER BY attempt_number ASC
    `);

    const attempts = attemptsStmt.all(assignmentId).map((attempt) => ({
      ...attempt,
      totalQuestions,
      passed: attempt.passed === null ? null : Boolean(attempt.passed),
    }));

    return res.status(200).json(attempts);
  } catch (error) {
    next(error);
  }
}