import { Router } from "express";
import { getAllCompanies } from "../controllers/company.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();



/**
 * @api {get} /api/companies Get All Companies
 * @apiName GetAllCompanies
 * @apiGroup Companies
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves a list of all registered companies. Restricted to Administrators only.
 *
 * @apiHeader {String} Authorization Bearer token required.
 *
 * @apiSuccess {Object[]} companies List of company objects.
 * @apiSuccess {Number} companies.id Company ID.
 * @apiSuccess {String} companies.name Company name.
 *
 * @apiError {Object} 401 Missing or invalid token.
 * @apiError {Object} 403 Forbidden - requires Administrator role.
 */
router.get(
  "/",
  authMiddleware,
  requireRole("Administrator"),
  getAllCompanies
);

export default router;