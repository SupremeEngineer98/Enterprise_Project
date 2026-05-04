// Checks that the request has a valid JWT token before allowing access to protected routes.
// The token must be in the Authorization header as: "Bearer <token>"
import { verifyAccessToken } from "../utils/jwt.js";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Reject if the header is missing or doesn't follow the "Bearer ..." format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Decode the token and attach the user's info to the request so later handlers can use it
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    // Token is either expired or was tampered with
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
