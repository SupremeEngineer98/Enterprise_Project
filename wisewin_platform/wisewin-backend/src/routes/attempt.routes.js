import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  startAttempt,
  getAttemptById,
  submitAnswer,
  submitAttempt,
  getAssignmentAttempts,
} from "../controllers/attempt.controller.js";

const router = Router();

router.post(
  "/assignments/:assignmentId/start",
  authMiddleware,
  requireRole("User"),
  startAttempt
);

router.get(
  "/:attemptId",
  authMiddleware,
  requireRole("Administrator", "Super user", "User"),
  getAttemptById
);

router.post(
  "/:attemptId/answers",
  authMiddleware,
  requireRole("User"),
  submitAnswer
);

router.post(
  "/:attemptId/submit",
  authMiddleware,
  requireRole("User"),
  submitAttempt
);

router.get(
  "/assignments/:assignmentId/history",
  authMiddleware,
  requireRole("Administrator", "Super user", "User"),
  getAssignmentAttempts
);

export default router;