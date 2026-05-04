// Question routes (legacy/secondary router — most question routes live under /api/quizzes).
// These endpoints are accessible to all logged-in users for reading, and to admins/super users for writing.
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import { createQuestion, getQuizQuestions } from "../controllers/question.controller.js";

const router = Router();

// Read questions for a quiz — any logged-in user can do this
router.get("/quizzes/:quizId", authMiddleware, requireRole("Administrator", "Super user", "User"), getQuizQuestions);

// Create a question for a quiz — admin/super user only
router.post("/quizzes/:quizId", authMiddleware, requireRole("Administrator", "Super user"), createQuestion);

export default router;
