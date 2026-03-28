INSERT INTO roles (id, name) VALUES
(1, 'Administrator'),
(2, 'Super user'),
(3, 'User');

INSERT INTO companies (id, name, status, created_at, updated_at) VALUES
(1, 'TechFlow Systems', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Creative Nexus', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (id, company_id, role_id, email, password_hash, is_active, created_at, updated_at) VALUES
(1, NULL, 1, 'admin@wisewin.com', '$2b$10$KVPcHejPXc.nel/thxpTAe4LpSoiX76cBfnqAiauBarAxSZWn3ctG', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, 'super.techflow@company.com', '$2b$10$KVPcHejPXc.nel/thxpTAe4LpSoiX76cBfnqAiauBarAxSZWn3ctG', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 2, 'super.creative@company.com', '$2b$10$KVPcHejPXc.nel/thxpTAe4LpSoiX76cBfnqAiauBarAxSZWn3ctG', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 1, 3, 'alice@techflow.com', '$2b$10$KVPcHejPXc.nel/thxpTAe4LpSoiX76cBfnqAiauBarAxSZWn3ctG', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 1, 3, 'bob@techflow.com', '$2b$10$KVPcHejPXc.nel/thxpTAe4LpSoiX76cBfnqAiauBarAxSZWn3ctG', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 2, 3, 'carol@creative.com', '$2b$10$KVPcHejPXc.nel/thxpTAe4LpSoiX76cBfnqAiauBarAxSZWn3ctG', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO quizzes (id, company_id, created_by, title, description, source_type, is_active, created_at, updated_at) VALUES
(1, NULL, 1, 'Cyber Security Awareness', 'Basic security training for all employees.', 'PLATFORM', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, 'Warehouse Safety Fundamentals', 'Company-specific safety training for TechFlow Systems.', 'COMPANY', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO questions (id, quiz_id, question_text, display_order, created_at, updated_at) VALUES
(1, 1, 'What is phishing?', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 'What is the safest first action after receiving a suspicious email?', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 'What should you do before lifting a heavy box?', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 'What is the correct action when you spot a spill on the warehouse floor?', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO question_options (id, question_id, option_text, is_correct, display_order) VALUES
(1, 1, 'A social engineering attack', 1, 1),
(2, 1, 'A database backup process', 0, 2),
(3, 1, 'A type of hardware failure', 0, 3),
(4, 1, 'An encryption algorithm', 0, 4),
(5, 2, 'Report the email to IT or security team', 1, 1),
(6, 2, 'Click the link to verify it', 0, 2),
(7, 2, 'Reply with your credentials', 0, 3),
(8, 2, 'Forward it to external contacts', 0, 4),
(9, 3, 'Assess the weight and use proper lifting technique', 1, 1),
(10, 3, 'Lift it immediately as fast as possible', 0, 2),
(11, 3, 'Twist your back while lifting', 0, 3),
(12, 3, 'Ignore posture completely', 0, 4),
(13, 4, 'Mark the area and report/clean it according to procedure', 1, 1),
(14, 4, 'Walk away and ignore it', 0, 2),
(15, 4, 'Run through it quickly', 0, 3),
(16, 4, 'Wait for someone else without warning others', 0, 4);