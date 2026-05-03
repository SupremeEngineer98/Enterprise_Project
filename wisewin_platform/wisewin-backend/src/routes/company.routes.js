import { Router } from "express";
import {
  getAllCompanies,
  getCompanyDetails,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/company.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

const adminOnly = [authMiddleware, requireRole("Administrator")];

// GET /api/companies
router.get("/", ...adminOnly, getAllCompanies);

// GET /api/companies/:id
router.get("/:id", ...adminOnly, getCompanyDetails);

// POST /api/companies
router.post("/", ...adminOnly, createCompany);

// PUT /api/companies/:id
router.put("/:id", ...adminOnly, updateCompany);

// DELETE /api/companies/:id
router.delete("/:id", ...adminOnly, deleteCompany);

export default router;