import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "super-secret-key-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  dbPath:
    process.env.NODE_ENV === "test"
     ? "src/database/wisewin.test.db" 
     : process.env.DB_PATH || "./wisewin.db",
};