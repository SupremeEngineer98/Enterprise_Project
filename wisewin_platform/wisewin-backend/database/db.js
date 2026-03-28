import Database from "better-sqlite3";
import { env } from "../config/env.js";

export const db = new Database(env.dbPath);
db.pragma("foreign_keys = ON");