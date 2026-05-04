// Handles creating and verifying JSON Web Tokens (JWTs)
// Tokens are used to keep users logged in — the frontend sends one with every request
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// Creates a signed token for a user after they log in.
// We embed the user's id, email, role, and company into the token payload.
export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

// Decodes and verifies a token. Throws an error if the token is expired or tampered with.
export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
