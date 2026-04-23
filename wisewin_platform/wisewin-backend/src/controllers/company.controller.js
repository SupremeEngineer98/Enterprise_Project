import { db } from "../database/db.js";

// GET all companies
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

// GET single company with users + quizzes
export function getCompanyDetails(req, res, next) {
  try {
    const { id } = req.params;

    const company = db.prepare(`
      SELECT id, name, status, created_at AS createdAt, updated_at AS updatedAt
      FROM companies WHERE id = ?
    `).get(id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const users = db.prepare(`
      SELECT u.id, u.email, u.is_active AS isActive, r.name AS role
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      WHERE u.company_id = ?
      ORDER BY u.email ASC
    `).all(id);

    const quizzes = db.prepare(`
      SELECT id, title, description, created_at AS createdAt
      FROM quizzes
      WHERE company_id = ?
      ORDER BY created_at DESC
    `).all(id);

    res.status(200).json({ ...company, users, quizzes });
  } catch (error) {
    next(error);
  }
}

// POST create company
export function createCompany(req, res, next) {
  try {
    const { name, status = "ACTIVE" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Company name is required" });
    }

    const existing = db.prepare(`SELECT id FROM companies WHERE name = ?`).get(name.trim());
    if (existing) {
      return res.status(409).json({ message: "A company with this name already exists" });
    }

    const stmt = db.prepare(`
      INSERT INTO companies (name, status, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `);

    const result = stmt.run(name.trim(), status);

    const company = db.prepare(`SELECT * FROM companies WHERE id = ?`).get(result.lastInsertRowid);
    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
}

// PUT update company
export function updateCompany(req, res, next) {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const existing = db.prepare(`SELECT id FROM companies WHERE id = ?`).get(id);
    if (!existing) {
      return res.status(404).json({ message: "Company not found" });
    }

    const stmt = db.prepare(`
      UPDATE companies
      SET name = COALESCE(?, name),
          status = COALESCE(?, status),
          updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(name?.trim() || null, status || null, id);

    const updated = db.prepare(`SELECT * FROM companies WHERE id = ?`).get(id);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

// DELETE company
export function deleteCompany(req, res, next) {
  try {
    const { id } = req.params;

    const existing = db.prepare(`SELECT id FROM companies WHERE id = ?`).get(id);
    if (!existing) {
      return res.status(404).json({ message: "Company not found" });
    }

    db.prepare(`DELETE FROM companies WHERE id = ?`).run(id);

    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    next(error);
  }
}