import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import { getVisibleQuizzes, createQuiz, updateQuiz, deleteQuiz } from "../controllers/quiz.controller.js";
import { createQuestion, getQuizQuestions, updateQuestion, deleteQuestion } from "../controllers/question.controller.js";

const router = Router();

const adminOrSuper = [authMiddleware, requireRole("Administrator", "Super user")];

// Quizzes
router.get("/", authMiddleware, getVisibleQuizzes);
router.post("/", ...adminOrSuper, createQuiz);
router.put("/:quizId", ...adminOrSuper, updateQuiz);
router.delete("/:quizId", ...adminOrSuper, deleteQuiz);

// Questions
router.get("/:quizId/questions", authMiddleware, getQuizQuestions);
router.post("/:quizId/questions", ...adminOrSuper, createQuestion);
router.put("/:quizId/questions/:questionId", ...adminOrSuper, updateQuestion);
router.delete("/:quizId/questions/:questionId", ...adminOrSuper, deleteQuestion);

export default router;