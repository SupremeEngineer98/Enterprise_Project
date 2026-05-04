// Auth routes — public login and a protected endpoint to get the current user's profile
import { Router } from "express";
import { login, me } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// POST /api/auth/login — no token needed, this is how you get one
router.post("/login", login);

// GET /api/auth/me — requires a valid token; returns the logged-in user's profile
router.get("/me", authMiddleware, me);

export default router;
