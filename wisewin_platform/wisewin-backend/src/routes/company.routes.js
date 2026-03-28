import { Router } from "express";
import { getAllCompanies } from "../controllers/company.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  requireRole("Administrator"),
  getAllCompanies
);

export default router;