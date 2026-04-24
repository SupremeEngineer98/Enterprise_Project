import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

import {
  getMyAssignments,
  selfAssignQuiz,
  getCompanyCompletedAssignments
} from "../controllers/assignment.controller.js";

const router = Router();

router.get("/me", authMiddleware, requireRole("User"), getMyAssignments);

router.get(
  "/company/:companyId/completed",
  authMiddleware,
  requireRole("Administrator", "Super user"),
  getCompanyCompletedAssignments
);

router.post(
  "/quizzes/:quizId/self",
  authMiddleware,
  requireRole("User"),
  selfAssignQuiz
);

export default router;