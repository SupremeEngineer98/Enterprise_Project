import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  startAttempt,
  getAttemptById,
  submitAnswer,
  submitAttempt,
  getAssignmentAttempts,
} from "../controllers/attempt.controller.js";

const router = Router();

/**
 * @api {post} /api/attempts/assignments/:assignmentId/start Start Quiz Attempt
 * @apiName StartAttempt
 * @apiGroup Attempts
 * @apiVersion 1.0.0
 *
 * @apiDescription Starts a new quiz attempt for a given assignment.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiParam {Number} assignmentId The ID of the assignment to start.
 *
 * @apiSuccess {Object} attempt The created attempt object.
 * @apiSuccess {Number} attempt.id Attempt ID.
 * @apiSuccess {String} attempt.status Attempt status (e.g. "in_progress").
 *
 * @apiError {Object} 401 Missing or invalid token.
 * @apiError {Object} 403 Forbidden - requires User role.
 */
router.post(
  "/assignments/:assignmentId/start",
  authMiddleware,
  requireRole("User"),
  startAttempt
);

/**
 * @api {get} /api/attempts/:attemptId Get Attempt by ID
 * @apiName GetAttemptById
 * @apiGroup Attempts
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves a specific attempt by its ID.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiParam {Number} attemptId The ID of the attempt to retrieve.
 *
 * @apiSuccess {Object} attempt The attempt object.
 * @apiSuccess {Number} attempt.id Attempt ID.
 * @apiSuccess {String} attempt.status Attempt status.
 * @apiSuccess {Number} attempt.score Attempt score.
 *
 * @apiError {Object} 401 Missing or invalid token.
 * @apiError {Object} 403 Forbidden - requires Administrator, Super user, or User role.
 * @apiError {Object} 404 Attempt not found.
 */
router.get(
  "/:attemptId",
  authMiddleware,
  requireRole("Administrator", "Super user", "User"),
  getAttemptById
);

/**
 * @api {post} /api/attempts/:attemptId/answers Submit Answer
 * @apiName SubmitAnswer
 * @apiGroup Attempts
 * @apiVersion 1.0.0
 *
 * @apiDescription Submits an answer for a question within an active attempt.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiParam {Number} attemptId The ID of the active attempt.
 *
 * @apiBody {Number} questionId The ID of the question being answered.
 * @apiBody {Number} optionId The ID of the selected answer option.
 *
 * @apiSuccess {Object} answer The submitted answer object.
 *
 * @apiError {Object} 401 Missing or invalid token.
 * @apiError {Object} 403 Forbidden - requires User role.
 * @apiError {Object} 404 Attempt or question not found.
 */
router.post(
  "/:attemptId/answers",
  authMiddleware,
  requireRole("User"),
  submitAnswer
);


/**
 * @api {post} /api/attempts/:attemptId/submit Submit Attempt
 * @apiName SubmitAttempt
 * @apiGroup Attempts
 * @apiVersion 1.0.0
 *
 * @apiDescription Finalizes and submits a completed quiz attempt.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiParam {Number} attemptId The ID of the attempt to submit.
 *
 * @apiSuccess {Object} result The result of the submitted attempt.
 * @apiSuccess {Number} result.score Final score.
 * @apiSuccess {String} result.status Final status (e.g. "completed").
 *
 * @apiError {Object} 401 Missing or invalid token.
 * @apiError {Object} 403 Forbidden - requires User role.
 * @apiError {Object} 404 Attempt not found.
 */
router.post(
  "/:attemptId/submit",
  authMiddleware,
  requireRole("User"),
  submitAttempt
);

/**
 * @api {get} /api/attempts/assignments/:assignmentId/history Get Assignment Attempt History
 * @apiName GetAssignmentAttempts
 * @apiGroup Attempts
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves all attempts made for a specific assignment.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiParam {Number} assignmentId The ID of the assignment.
 *
 * @apiSuccess {Object[]} attempts List of attempt objects.
 * @apiSuccess {Number} attempts.id Attempt ID.
 * @apiSuccess {String} attempts.status Attempt status.
 * @apiSuccess {Number} attempts.score Attempt score.
 *
 * @apiError {Object} 401 Missing or invalid token.
 * @apiError {Object} 403 Forbidden - requires Administrator, Super user, or User role.
 * @apiError {Object} 404 Assignment not found.
 */
router.get(
  "/assignments/:assignmentId/history",
  authMiddleware,
  requireRole("Administrator", "Super user", "User"),
  getAssignmentAttempts
);

export default router;