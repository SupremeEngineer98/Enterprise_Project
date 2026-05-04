// Quick helper script — run it manually to generate a bcrypt hash for a plain text password.
// Useful when you need to manually insert a user into the database.
// Usage: node src/scripts/hashPassword.js
import bcrypt from "bcryptjs";

const password = "password123";
const hash = bcrypt.hashSync(password, 10);

console.log("HASH:", hash);
