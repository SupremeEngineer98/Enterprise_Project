import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createUser,
  getAllUsers,
  getCompanyUsers,
  changePassword,
  getCompanyAssignmentStats,
  getUserComparison,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

const router = Router();

// Change password (self or admin/superuser)
router.put("/:userId/password", authMiddleware, requireRole("Administrator", "Super user", "User"), changePassword);

// Create user
router.post("/", authMiddleware, requireRole("Administrator", "Super user"), createUser);

// Get all users (admin only)
router.get("/", authMiddleware, requireRole("Administrator"), getAllUsers);

// Update user (admin + super user)
router.put("/:userId", authMiddleware, requireRole("Administrator", "Super user"), updateUser);

// Delete user (admin only)
router.delete("/:userId", authMiddleware, requireRole("Administrator"), deleteUser);

// Company users
router.get("/company/:companyId", authMiddleware, requireRole("Administrator", "Super user"), getCompanyUsers);
router.get("/company/:companyId/stats", authMiddleware, requireRole("Administrator", "Super user"), getCompanyAssignmentStats);
router.get("/company/:companyId/comparison", authMiddleware, requireRole("Administrator", "Super user", "User"), getUserComparison);

export default router;