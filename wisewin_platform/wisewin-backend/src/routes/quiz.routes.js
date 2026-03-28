import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import { getVisibleQuizzes, createQuiz } from "../controllers/quiz.controller.js";

const router = Router();

router.get("/", authMiddleware, getVisibleQuizzes);

router.post(
  "/",
  authMiddleware,
  requireRole("Administrator", "Super user"),
  createQuiz
);

export default router;