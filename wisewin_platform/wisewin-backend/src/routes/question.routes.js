import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import { createQuestion, getQuizQuestions } from "../controllers/question.controller.js";

const router = Router();



/**
 * @api {get} /api/questions/quizzes/:quizId Get Quiz Questions
 * @apiName GetQuizQuestions
 * @apiGroup Questions
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves all questions for a specific quiz.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiParam {Number} quizId The ID of the quiz to retrieve questions for.
 *
 * @apiSuccess {Object[]} questions List of question objects.
 * @apiSuccess {Number} questions.id Question ID.
 * @apiSuccess {String} questions.question_text The question text.
 * @apiSuccess {Number} questions.display_order Display order of the question.
 * @apiSuccess {Object[]} questions.options List of answer options.
 * @apiSuccess {Number} questions.options.id Option ID.
 * @apiSuccess {String} questions.options.option_text Option text.
 * @apiSuccess {Boolean} questions.options.is_correct Whether the option is correct.
 *
 * @apiError {Object} 401 Missing or invalid token.
 * @apiError {Object} 403 Forbidden - requires Administrator, Super user, or User role.
 * @apiError {Object} 404 Quiz not found.
 */
router.get(
  "/quizzes/:quizId",
  authMiddleware,
  requireRole("Administrator", "Super user", "User"),
  getQuizQuestions
);



/**
 * @api {post} /api/questions/quizzes/:quizId Create Question
 * @apiName CreateQuestion
 * @apiGroup Questions
 * @apiVersion 1.0.0
 *
 * @apiDescription Creates a new question for a specific quiz.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiParam {Number} quizId The ID of the quiz to add a question to.
 *
 * @apiBody {String} question_text The text of the question.
 * @apiBody {Number} display_order The display order of the question.
 * @apiBody {Object[]} options List of answer options.
 * @apiBody {String} options.option_text Text of the answer option.
 * @apiBody {Boolean} options.is_correct Whether the option is correct.
 *
 * @apiSuccess {Object} question The created question object.
 * @apiSuccess {Number} question.id Question ID.
 * @apiSuccess {String} question.question_text The question text.
 *
 * @apiError {Object} 401 Missing or invalid token.
 * @apiError {Object} 403 Forbidden - requires Administrator or Super user role.
 * @apiError {Object} 404 Quiz not found.
 */
router.post(
  "/quizzes/:quizId",
  authMiddleware,
  requireRole("Administrator", "Super user"),
  createQuestion
);

export default router;