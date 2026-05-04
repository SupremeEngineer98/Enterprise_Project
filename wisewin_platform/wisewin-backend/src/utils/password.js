// Utility functions for hashing and checking passwords using bcrypt.
// We never store plain text passwords — only the hashed version.
import bcrypt from "bcryptjs";

// Higher salt rounds = harder to crack but slower to compute. 10 is a good default.
const SALT_ROUNDS = 10;

// Hashes a plain text password before saving it to the database
export function hashPassword(plainPassword) {
  return bcrypt.hashSync(plainPassword, SALT_ROUNDS);
}

// Compares what the user typed with the stored hash to check if it's correct
export function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compareSync(plainPassword, passwordHash);
}
