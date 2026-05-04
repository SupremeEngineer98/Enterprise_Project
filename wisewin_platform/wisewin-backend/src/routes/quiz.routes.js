// Quiz routes — reading quizzes is open to any logged-in user; creating/editing/deleting is admin only
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import { getVisibleQuizzes, createQuiz, updateQuiz, deleteQuiz } from "../controllers/quiz.controller.js";
import { createQuestion, getQuizQuestions, updateQuestion, deleteQuestion } from "../controllers/question.controller.js";

const router = Router();

// Shorthand for the two admin-level roles so we don't repeat it on every line
const adminOrSuper = [authMiddleware, requireRole("Administrator", "Super user")];

// Quiz CRUD
router.get("/", authMiddleware, getVisibleQuizzes);
router.post("/", ...adminOrSuper, createQuiz);
router.put("/:quizId", ...adminOrSuper, updateQuiz);
router.delete("/:quizId", ...adminOrSuper, deleteQuiz);

// Question CRUD (nested under a quiz)
router.get("/:quizId/questions", authMiddleware, getQuizQuestions);
router.post("/:quizId/questions", ...adminOrSuper, createQuestion);
router.put("/:quizId/questions/:questionId", ...adminOrSuper, updateQuestion);
router.delete("/:quizId/questions/:questionId", ...adminOrSuper, deleteQuestion);

export default router;
