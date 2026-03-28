import { loginUser, getCurrentUserById } from "../services/auth.service.js";
import { signAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";

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

export function me(req, res, next) {
  try {
    const user = getCurrentUserById(req.user.sub);
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}