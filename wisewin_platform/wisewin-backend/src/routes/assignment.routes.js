import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import { getMyAssignments, createAssignment } from "../controllers/assignment.controller.js";

const router = Router();

router.get(
  "/me",
  authMiddleware,
  requireRole("User"),
  getMyAssignments
);

router.post(
  "/quizzes/:quizId",
  authMiddleware,
  requireRole("Administrator", "Super user"),
  createAssignment
);

export default router;