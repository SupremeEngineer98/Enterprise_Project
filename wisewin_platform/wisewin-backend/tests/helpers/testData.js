import bcrypt from "bcryptjs";
import { db } from "../../src/database/db.js";

export function createTestUser({
  email = `test.user.${Date.now()}.${Math.random()}@wisewin.com`,
  password = "password123",
  roleId = 3,
  companyId = 1,
} = {}) {
  const passwordHash = bcrypt.hashSync(password, 10);

  const result = db.prepare(`
    INSERT INTO users (
      company_id,
      role_id,
      email,
      password_hash,
      is_active,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(companyId, roleId, email, passwordHash);

  return {
    id: result.lastInsertRowid,
    email,
    password,
    roleId,
    companyId,
  };
}

export function createTestQuizWithAssignment({
  userId,
  assignedBy = 2,
  companyId = 1,
} = {}) {
  const quizResult = db.prepare(`
    INSERT INTO quizzes (
      company_id,
      created_by,
      title,
      description,
      source_type,
      max_wrong_answers,
      is_active,
      created_at,
      updated_at
    )
    VALUES (?, ?, 'Automated Test Quiz', 'Quiz created by automated tests', 'COMPANY', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(companyId, assignedBy);

  const quizId = quizResult.lastInsertRowid;

  const questionResult = db.prepare(`
    INSERT INTO questions (
      quiz_id,
      question_text,
      display_order,
      created_at,
      updated_at
    )
    VALUES (?, 'What is the correct option?', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(quizId);

  const questionId = questionResult.lastInsertRowid;

  const correctOptionResult = db.prepare(`
    INSERT INTO question_options (
      question_id,
      option_text,
      is_correct,
      display_order
    )
    VALUES (?, 'Correct answer', 1, 1)
  `).run(questionId);

  const wrongOptionResult = db.prepare(`
    INSERT INTO question_options (
      question_id,
      option_text,
      is_correct,
      display_order
    )
    VALUES (?, 'Wrong answer', 0, 2)
  `).run(questionId);

  const assignmentResult = db.prepare(`
    INSERT INTO quiz_assignments (
      quiz_id,
      user_id,
      assigned_by,
      assigned_at,
      due_date,
      status,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, '2026-06-01', 'ASSIGNED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(quizId, userId, assignedBy);

  return {
    quizId,
    questionId,
    correctOptionId: correctOptionResult.lastInsertRowid,
    wrongOptionId: wrongOptionResult.lastInsertRowid,
    assignmentId: assignmentResult.lastInsertRowid,
  };
}