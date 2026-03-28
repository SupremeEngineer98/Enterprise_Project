import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createUser,
  getAllUsers,
  getCompanyUsers,
  changePassword,
} from "../controllers/user.controller.js";


const router = Router();

router.put(
  "/:userId/password",
  authMiddleware,
  requireRole("Administrator", "Super user", "User"),
  changePassword
);

router.post(
  "/",
  authMiddleware,
  requireRole("Administrator", "Super user"),
  createUser
);

router.get(
  "/",
  authMiddleware,
  requireRole("Administrator"),
  getAllUsers
);

router.get(
  "/company/:companyId",
  authMiddleware,
  requireRole("Administrator", "Super user"),
  getCompanyUsers
);

export default router;