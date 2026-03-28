import { db } from "../database/db.js";
import { ApiError } from "../utils/apiError.js";
import { comparePassword } from "../utils/password.js";

export function loginUser(email, password) {
  const stmt = db.prepare(`
    SELECT
      u.id,
      u.email,
      u.password_hash,
      u.is_active,
      u.company_id AS companyId,
      r.name AS role
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    WHERE u.email = ?
  `);

  const user = stmt.get(email);

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.is_active) {
    throw new ApiError(403, "Inactive account");
  }

  const isPasswordValid = comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
  };
}

export function getCurrentUserById(userId) {
  const stmt = db.prepare(`
    SELECT
      u.id,
      u.email,
      u.is_active AS isActive,
      u.company_id AS companyId,
      r.name AS role
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    WHERE u.id = ?
  `);

  const user = stmt.get(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
}