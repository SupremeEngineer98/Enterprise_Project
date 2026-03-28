import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import { createQuestion, getQuizQuestions } from "../controllers/question.controller.js";

const router = Router();

router.get(
  "/quizzes/:quizId",
  authMiddleware,
  requireRole("Administrator", "Super user", "User"),
  getQuizQuestions
);

router.post(
  "/quizzes/:quizId",
  authMiddleware,
  requireRole("Administrator", "Super user"),
  createQuestion
);

export default router;