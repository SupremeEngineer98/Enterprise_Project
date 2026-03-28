import { db } from "../database/db.js";

export function getAllCompanies(req, res, next) {
  try {
    const stmt = db.prepare(`
      SELECT
        id,
        name,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM companies
      ORDER BY id DESC
    `);

    const companies = stmt.all();
    res.status(200).json(companies);
  } catch (error) {
    next(error);
  }
}