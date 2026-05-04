// Opens the SQLite database file using better-sqlite3
// The path comes from the config so it switches automatically for tests
import Database from "better-sqlite3";
import { env } from "../config/env.js";

export const db = new Database(env.dbPath);

// Tell SQLite to enforce foreign key constraints — without this, cascading deletes wouldn't work
db.pragma("foreign_keys = ON");
