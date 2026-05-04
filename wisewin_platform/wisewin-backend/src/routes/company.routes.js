// Company routes — all restricted to Administrators only
import { Router } from "express";
import { getAllCompanies, getCompanyDetails, createCompany, updateCompany, deleteCompany } from "../controllers/company.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

const adminOnly = [authMiddleware, requireRole("Administrator")];

router.get("/", ...adminOnly, getAllCompanies);
router.get("/:id", ...adminOnly, getCompanyDetails);
router.post("/", ...adminOnly, createCompany);
router.put("/:id", ...adminOnly, updateCompany);
router.delete("/:id", ...adminOnly, deleteCompany);

export default router;
