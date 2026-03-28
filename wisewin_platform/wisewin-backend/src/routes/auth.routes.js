import { Router } from "express";
import { login, me } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();


/**
 * @api {post} /api/auth/login Login
 * @apiName Login
 * @apiGroup Auth
 * @apiVersion 1.0.0
 *
 * @apiDescription Authenticates a user and returns a signed JWT access token.
 *
 * @apiBody {String} email User's email address.
 * @apiBody {String} password User's password.
 *
 * @apiSuccess {String} token Signed JWT access token.
 * @apiSuccess {Object} user Authenticated user object.
 * @apiSuccess {Number} user.id User ID.
 * @apiSuccess {String} user.email User email.
 * @apiSuccess {String} user.role User role.
 *
 * @apiError {Object} 400 Missing email or password.
 * @apiError {Object} 401 Invalid credentials.
 */
router.post("/login", login);



/**
 * @api {get} /api/auth/me Get Current User
 * @apiName Me
 * @apiGroup Auth
 * @apiVersion 1.0.0
 *
 * @apiDescription Returns the currently authenticated user's profile based on the JWT token.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiSuccess {Number} user.id User ID.
 * @apiSuccess {String} user.email User email.
 * @apiSuccess {String} user.role User role.
 * @apiSuccess {Number} user.companyId Company ID the user belongs to.
 *
 * @apiError {Object} 401 Missing or invalid token.
 */
router.get("/me", authMiddleware, me);

export default router;