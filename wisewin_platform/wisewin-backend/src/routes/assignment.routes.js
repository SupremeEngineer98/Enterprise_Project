// Assignment routes — controls who can create, view, and self-assign quizzes
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  getMyAssignments, createAssignment, selfAssignQuiz,
  getCompanyCompletedAssignments, getUserPendingAssignments,
} from "../controllers/assignment.controller.js";

const router = Router();

// Regular user sees their own assignments
router.get("/me", authMiddleware, requireRole("User"), getMyAssignments);

// Admin/super user assigns a quiz to a specific user
router.post("/quizzes/:quizId", authMiddleware, requireRole("Administrator", "Super user"), createAssignment);

// Regular user self-assigns a quiz without needing an admin
router.post("/quizzes/:quizId/self", authMiddleware, requireRole("User"), selfAssignQuiz);

// Admin/super user views pending or completed assignments for reporting
router.get("/user/:userId/pending", authMiddleware, requireRole("Administrator", "Super user"), getUserPendingAssignments);
router.get("/company/:companyId/completed", authMiddleware, requireRole("Administrator", "Super user"), getCompanyCompletedAssignments);

export default router;
