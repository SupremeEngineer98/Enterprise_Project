import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import { getMyAssignments, createAssignment } from "../controllers/assignment.controller.js";

const router = Router();

/**
 * @api {get} /api/assignments/me Get My Assignments
 * @apiName GetMyAssignments
 * @apiGroup Assignments
 * @apiVersion 1.0.0
 *
 * @apiDescription Returns all quiz assignments for the currently logged-in user.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiSuccess {Object[]} assignments List of assignments.
 * @apiSuccess {Number} assignments.id Assignment ID.
 * @apiSuccess {Number} assignments.quiz_id Quiz ID.
 * @apiSuccess {String} assignments.status Assignment status.
 * @apiSuccess {String} assignments.due_date Due date of the assignment.
 *
 * @apiError {Object} 401 Missing or invalid token.
 * @apiError {Object} 403 Forbidden - requires User role.
 */

router.get(
  "/me",
  authMiddleware,
  requireRole("User"),
  getMyAssignments
);

/**
 * @api {post} /api/assignments/quizzes/:quizId Assign Quiz to Users
 * @apiName CreateAssignment
 * @apiGroup Assignments
 * @apiVersion 1.0.0
 *
 * @apiDescription Assigns a quiz to one or more users. Restricted to Administrators and Super users.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiParam {Number} quizId The ID of the quiz to assign.
 *
 * @apiBody {Number[]} userIds List of user IDs to assign the quiz to.
 * @apiBody {String} due_date Due date for the assignment.
 *
 * @apiSuccess {Object} assignment The created assignment object.
 *
 * @apiError {Object} 401 Missing or invalid token.
 * @apiError {Object} 403 Forbidden - requires Administrator or Super user role.
 */

router.post(
  "/quizzes/:quizId",
  authMiddleware,
  requireRole("Administrator", "Super user"),
  createAssignment
);

export default router;