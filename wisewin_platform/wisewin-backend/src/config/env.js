// Load environment variables from the .env file into process.env
import dotenv from "dotenv";
dotenv.config();

// Export all config values in one place so the rest of the app can import from here
// If a value isn't set in .env, sensible defaults are used
export const env = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "super-secret-key-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",

  // Use a separate test database when running tests so we don't mess up real data
  dbPath:
    process.env.NODE_ENV === "test"
      ? "src/database/wisewin.test.db"
      : process.env.DB_PATH || "./wisewin.db",
};
