import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, "schema.sql");
const seedPath = path.join(__dirname, "seed.sql");

const schemaSql = fs.readFileSync(schemaPath, "utf-8");
const seedSql = fs.readFileSync(seedPath, "utf-8");

db.exec(schemaSql);
db.exec(seedSql);

console.log("Database initialized successfully.");