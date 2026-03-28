import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createUser,
  getAllUsers,
  getCompanyUsers,
  changePassword,
} from "../controllers/user.controller.js";


const router = Router();


/**
 * @api {put} /api/users/:userId/password Change Password
 * @apiName ChangePassword
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiDescription Allows a user to change their password.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiParam {Number} userId The ID of the user changing their password.
 *
 * @apiBody {String} currentPassword The user's current password.
 * @apiBody {String} newPassword The user's new password.
 *
 * @apiSuccess {Object} message Confirmation that password was changed successfully.
 *
 * @apiError {Object} 401 Missing or invalid token.
 * @apiError {Object} 403 Forbidden - requires Administrator, Super user, or User role.
 * @apiError {Object} 404 User not found.
 */
router.put(
  "/:userId/password",
  authMiddleware,
  requireRole("Administrator", "Super user", "User"),
  changePassword
);


/**
 * @api {post} /api/users Create User
 * @apiName CreateUser
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiDescription Creates a new user. Restricted to Administrators and Super users.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiBody {String} email User's email address.
 * @apiBody {String} password User's password.
 * @apiBody {Number} role_id Role ID to assign to the user.
 * @apiBody {Number} company_id Company ID the user belongs to.
 *
 * @apiSuccess {Object} user The created user object.
 * @apiSuccess {Number} user.id User ID.
 * @apiSuccess {String} user.email User email.
 * @apiSuccess {String} user.role User role.
 *
 * @apiError {Object} 400 Missing required fields.
 * @apiError {Object} 401 Missing or invalid token.
 * @apiError {Object} 403 Forbidden - requires Administrator or Super user role.
 */
router.post(
  "/",
  authMiddleware,
  requireRole("Administrator", "Super user"),
  createUser
);


/**
 * @api {get} /api/users Get All Users
 * @apiName GetAllUsers
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves a list of all users across all companies. Restricted to Administrators only.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiSuccess {Object[]} users List of user objects.
 * @apiSuccess {Number} users.id User ID.
 * @apiSuccess {String} users.email User email.
 * @apiSuccess {String} users.role User role.
 * @apiSuccess {Number} users.company_id Company ID the user belongs to.
 * @apiSuccess {Boolean} users.is_active Whether the user is active.
 *
 * @apiError {Object} 401 Missing or invalid token.
 * @apiError {Object} 403 Forbidden - requires Administrator role.
 */
router.get(
  "/",
  authMiddleware,
  requireRole("Administrator"),
  getAllUsers
);


/**
 * @api {get} /api/users/company/:companyId Get Company Users
 * @apiName GetCompanyUsers
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves all users belonging to a specific company.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiParam {Number} companyId The ID of the company to retrieve users for.
 *
 * @apiSuccess {Object[]} users List of user objects.
 * @apiSuccess {Number} users.id User ID.
 * @apiSuccess {String} users.email User email.
 * @apiSuccess {String} users.role User role.
 * @apiSuccess {Boolean} users.is_active Whether the user is active.
 *
 * @apiError {Object} 401 Missing or invalid token.
 * @apiError {Object} 403 Forbidden - requires Administrator or Super user role.
 * @apiError {Object} 404 Company not found.
 */
router.get(
  "/company/:companyId",
  authMiddleware,
  requireRole("Administrator", "Super user"),
  getCompanyUsers
);

export default router;