// This script sets up the database from scratch.
// It reads the SQL schema file and the seed data file, then runs them both.
// Run this once when setting up the project for the first time.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

// __dirname doesn't exist in ES modules, so we rebuild it from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, "schema.sql");
const seedPath = path.join(__dirname, "seed.sql");

// Read and run the schema (creates tables) then the seed (inserts default data)
const schemaSql = fs.readFileSync(schemaPath, "utf-8");
const seedSql = fs.readFileSync(seedPath, "utf-8");

db.exec(schemaSql);
db.exec(seedSql);

console.log("Database initialized successfully.");
