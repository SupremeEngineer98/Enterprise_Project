--hash for password = password123
--$2b$10$KVPcHejPXc.nel/thxpTAe4LpSoiX76cBfnqAiauBarAxSZWn3ctG

-- ROLES
INSERT INTO roles (id, name) VALUES
(1, 'Administrator'),
(2, 'Super user'),
(3, 'User');

-- COMPANIES
INSERT INTO companies (id, name, status, created_at, updated_at) VALUES
(1, 'TechFlow Systems', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Creative Nexus', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- USERS (password = password123 hashed)
INSERT INTO users (id, company_id, role_id, email, password_hash, is_active, created_at, updated_at) VALUES
(1, NULL, 1, 'admin@wisewin.com', '$2b$10$KVPcHejPXc.nel/thxpTAe4LpSoiX76cBfnqAiauBarAxSZWn3ctG', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, 'super.techflow@company.com', '$2b$10$KVPcHejPXc.nel/thxpTAe4LpSoiX76cBfnqAiauBarAxSZWn3ctG', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 2, 'super.creative@company.com', '$2b$10$KVPcHejPXc.nel/thxpTAe4LpSoiX76cBfnqAiauBarAxSZWn3ctG', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 1, 3, 'alice@techflow.com', '$2b$10$KVPcHejPXc.nel/thxpTAe4LpSoiX76cBfnqAiauBarAxSZWn3ctG', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 1, 3, 'bob@techflow.com', '$2b$10$KVPcHejPXc.nel/thxpTAe4LpSoiX76cBfnqAiauBarAxSZWn3ctG', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 2, 3, 'carol@creative.com', '$2b$10$KVPcHejPXc.nel/thxpTAe4LpSoiX76cBfnqAiauBarAxSZWn3ctG', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- QUIZZES (NEW FIELD: max_wrong_answers)
INSERT INTO quizzes (
    id, company_id, created_by, title, description, source_type, max_wrong_answers, is_active, created_at, updated_at
) VALUES
(1, NULL, 1, 'Cyber Security Awareness', 'Basic security training.', 'PLATFORM', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, 'Warehouse Safety', 'Internal company training.', 'COMPANY', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- QUESTIONS
INSERT INTO questions (id, quiz_id, question_text, display_order, created_at, updated_at) VALUES
(1, 1, 'What is phishing?', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 'Strong password length?', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 'How to lift safely?', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- OPTIONS
INSERT INTO question_options (id, question_id, option_text, is_correct, display_order) VALUES
(1, 1, 'A social engineering attack', 1, 1),
(2, 1, 'A database issue', 0, 2),

(3, 2, '6 characters', 0, 1),
(4, 2, '12+ characters', 1, 2),

(5, 3, 'Use proper posture', 1, 1),
(6, 3, 'Lift quickly', 0, 2);

-- ASSIGNMENTS
INSERT INTO quiz_assignments (
    id, quiz_id, user_id, assigned_by, assigned_at, due_date, status, created_at, updated_at
) VALUES
(1, 1, 4, 2, CURRENT_TIMESTAMP, '2026-06-01', 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 5, 2, CURRENT_TIMESTAMP, '2026-06-01', 'ASSIGNED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 4, 2, CURRENT_TIMESTAMP, '2026-06-10', 'ASSIGNED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ATTEMPTS (NEW FIELDS: attempt_number, passed)

-- Alice: first attempt FAILED
INSERT INTO quiz_attempts (
    id, assignment_id, attempt_number, status, current_score, answered_count, passed, started_at, last_activity_at, completed_at
) VALUES
(1, 1, 1, 'COMPLETED', 1, 2, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Alice: second attempt PASSED
(2, 1, 2, 'COMPLETED', 2, 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Bob: currently in progress
(3, 2, 1, 'IN_PROGRESS', 1, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- ATTEMPT ANSWERS
INSERT INTO quiz_attempt_answers (
    id, attempt_id, question_id, selected_option_id, is_correct, answered_at
) VALUES
-- Alice failed attempt
(1, 1, 1, 1, 1, CURRENT_TIMESTAMP),
(2, 1, 2, 3, 0, CURRENT_TIMESTAMP),

-- Alice passed attempt
(3, 2, 1, 1, 1, CURRENT_TIMESTAMP),
(4, 2, 2, 4, 1, CURRENT_TIMESTAMP),

-- Bob in progress
(5, 3, 1, 1, 1, CURRENT_TIMESTAMP);
