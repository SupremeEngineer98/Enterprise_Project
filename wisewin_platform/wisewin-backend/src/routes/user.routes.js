// User routes — all routes require a valid token (authMiddleware) plus a role check (requireRole)
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createUser, getAllUsers, getCompanyUsers, changePassword,
  getCompanyAssignmentStats, getUserComparison, updateUser, deleteUser,
} from "../controllers/user.controller.js";

const router = Router();

// Any logged-in user can change a password, but the controller itself enforces who can change whose
router.put("/:userId/password", authMiddleware, requireRole("Administrator", "Super user", "User"), changePassword);

router.post("/", authMiddleware, requireRole("Administrator", "Super user"), createUser);
router.get("/", authMiddleware, requireRole("Administrator"), getAllUsers);
router.put("/:userId", authMiddleware, requireRole("Administrator", "Super user"), updateUser);
router.delete("/:userId", authMiddleware, requireRole("Administrator", "Super user"), deleteUser);

// Company-scoped user endpoints — Super users only see their own company's data
router.get("/company/:companyId", authMiddleware, requireRole("Administrator", "Super user"), getCompanyUsers);
router.get("/company/:companyId/stats", authMiddleware, requireRole("Administrator", "Super user"), getCompanyAssignmentStats);
router.get("/company/:companyId/comparison", authMiddleware, requireRole("Administrator", "Super user", "User"), getUserComparison);

export default router;
