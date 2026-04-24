import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  getMyAssignments,
  selfAssignQuiz,
  getCompanyCompletedAssignments,
  getUserPendingAssignments,
} from "../controllers/assignment.controller.js";

const router = Router();

router.get("/me", authMiddleware, requireRole("User"), getMyAssignments);

router.post(
  "/quizzes/:quizId/self",
  authMiddleware,
  requireRole("User"),
  selfAssignQuiz
);

router.get(
  "/user/:userId/pending",
  authMiddleware,
  requireRole("Administrator", "Super user"),
  getUserPendingAssignments
);

router.get(
  "/company/:companyId/completed",
  authMiddleware,
  requireRole("Administrator", "Super user"),
  getCompanyCompletedAssignments
);

export default router;