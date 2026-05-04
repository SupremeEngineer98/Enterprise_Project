// Attempt routes — controls the full quiz-taking flow for a regular user:
// start → answer questions → submit.
// Admins and super users can also read attempt history for reporting.
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import { startAttempt, getAttemptById, submitAnswer, submitAttempt, getAssignmentAttempts } from "../controllers/attempt.controller.js";

const router = Router();

// Start (or resume) an attempt for a given assignment — only the assigned user can do this
router.post("/assignments/:assignmentId/start", authMiddleware, requireRole("User"), startAttempt);

// Get the current state of an attempt (score, next question, etc.)
router.get("/:attemptId", authMiddleware, requireRole("Administrator", "Super user", "User"), getAttemptById);

// Submit a single answer during an active attempt
router.post("/:attemptId/answers", authMiddleware, requireRole("User"), submitAnswer);

// Finalise the attempt once all questions are answered
router.post("/:attemptId/submit", authMiddleware, requireRole("User"), submitAttempt);

// Get the full history of all attempts for an assignment (used by admins and the user themselves)
router.get("/assignments/:assignmentId/history", authMiddleware, requireRole("Administrator", "Super user", "User"), getAssignmentAttempts);

export default router;
