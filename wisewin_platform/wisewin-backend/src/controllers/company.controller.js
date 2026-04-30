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

// =========================
// DELETE COMPANY — διαγραφή όλων
// =========================
export function deleteCompany(req, res, next) {
  try {
    const { id } = req.params;
 
    const existing = db.prepare(`SELECT id FROM companies WHERE id = ?`).get(id);
    if (!existing) throw new ApiError(404, "Company not found");
 
    db.transaction(() => {
      // 1. Attempt answers
      db.prepare(`
        DELETE FROM quiz_attempt_answers
        WHERE attempt_id IN (
          SELECT at.id FROM quiz_attempts at
          INNER JOIN quiz_assignments qa ON qa.id = at.assignment_id
          INNER JOIN users u ON u.id = qa.user_id
          WHERE u.company_id = ?
        )
      `).run(id);
 
      // 2. Attempts
      db.prepare(`
        DELETE FROM quiz_attempts
        WHERE assignment_id IN (
          SELECT qa.id FROM quiz_assignments qa
          INNER JOIN users u ON u.id = qa.user_id
          WHERE u.company_id = ?
        )
      `).run(id);
 
      // 3. Assignments
      db.prepare(`
        DELETE FROM quiz_assignments
        WHERE user_id IN (SELECT id FROM users WHERE company_id = ?)
      `).run(id);
 
      // 4. Quiz questions options
      db.prepare(`
        DELETE FROM question_options
        WHERE question_id IN (
          SELECT q.id FROM questions q
          INNER JOIN quizzes qz ON qz.id = q.quiz_id
          WHERE qz.company_id = ?
        )
      `).run(id);
 
      // 5. Quiz questions
      db.prepare(`
        DELETE FROM questions
        WHERE quiz_id IN (SELECT id FROM quizzes WHERE company_id = ?)
      `).run(id);
 
      // 6. Quizzes
      db.prepare(`DELETE FROM quizzes WHERE company_id = ?`).run(id);
 
      // 7. Users
      db.prepare(`DELETE FROM users WHERE company_id = ?`).run(id);
 
      // 8. Company
      db.prepare(`DELETE FROM companies WHERE id = ?`).run(id);
    })();
 
    return res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    next(error);
  }
}