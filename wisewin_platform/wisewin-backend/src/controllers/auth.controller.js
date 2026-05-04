// Auth controller — handles login and returning the current user's profile.
import { loginUser, getCurrentUserById } from "../services/auth.service.js";
import { signAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";

// POST /api/auth/login
// Validates credentials, creates a JWT token, and sends it back with the user info.
export function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const user = loginUser(email, password);
    const token = signAccessToken(user);

    return res.status(200).json({
      token,
      expiresIn: "1h",
      user,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me
// Returns the profile of whoever is currently logged in (identified by their token).
export function me(req, res, next) {
  try {
    const user = getCurrentUserById(req.user.sub);
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}
