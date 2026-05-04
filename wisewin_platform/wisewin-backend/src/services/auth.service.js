// Auth service — handles the actual database logic for login and fetching the current user.
// The controller calls these functions; they throw ApiErrors on failure so the error handler catches them.
import { db } from "../database/db.js";
import { ApiError } from "../utils/apiError.js";
import { comparePassword } from "../utils/password.js";

// Checks the email and password against the database and returns the user if they match.
// Throws 401 if the credentials are wrong, 403 if the account is disabled.
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

  // Only return safe fields — never send the password hash to the client
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
  };
}

// Fetches a user by their ID (taken from the JWT token).
// Used by the /me endpoint so a logged-in user can see their own profile.
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
