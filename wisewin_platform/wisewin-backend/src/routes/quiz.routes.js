import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import { getVisibleQuizzes, createQuiz } from "../controllers/quiz.controller.js";

const router = Router();


/**
 * @api {get} /api/quizzes Get Visible Quizzes
 * @apiName GetVisibleQuizzes
 * @apiGroup Quizzes
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves all quizzes visible to the currently authenticated user.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiSuccess {Object[]} quizzes List of quiz objects.
 * @apiSuccess {Number} quizzes.id Quiz ID.
 * @apiSuccess {String} quizzes.title Quiz title.
 * @apiSuccess {String} quizzes.description Quiz description.
 * @apiSuccess {String} quizzes.source_type Quiz source type (e.g. "PLATFORM", "COMPANY").
 * @apiSuccess {Boolean} quizzes.is_active Whether the quiz is active.
 *
 * @apiError {Object} 401 Missing or invalid token.
 */
router.get("/", authMiddleware, getVisibleQuizzes);



/**
 * @api {post} /api/quizzes Create Quiz
 * @apiName CreateQuiz
 * @apiGroup Quizzes
 * @apiVersion 1.0.0
 *
 * @apiDescription Creates a new quiz. Restricted to Administrators and Super users.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiBody {String} title Title of the quiz.
 * @apiBody {String} description Description of the quiz.
 * @apiBody {String} source_type Source type of the quiz ("PLATFORM" or "COMPANY").
 * @apiBody {Number} max_wrong_answers Maximum number of wrong answers allowed.
 * @apiBody {Boolean} is_active Whether the quiz is active.
 *
 * @apiSuccess {Object} quiz The created quiz object.
 * @apiSuccess {Number} quiz.id Quiz ID.
 * @apiSuccess {String} quiz.title Quiz title.
 * @apiSuccess {String} quiz.description Quiz description.
 *
 * @apiError {Object} 401 Missing or invalid token.
 * @apiError {Object} 403 Forbidden - requires Administrator or Super user role.
 */
router.post(
  "/",
  authMiddleware,
  requireRole("Administrator", "Super user"),
  createQuiz
);

export default router;