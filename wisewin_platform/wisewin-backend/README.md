# WiseWin Backend

Backend API for the WiseWin employee training platform.

## Overview

WiseWin is a multi-role employee training platform that supports:

- authentication
- role-based access control
- company-based user segregation
- quiz creation and assignment
- quiz attempts
- pass/fail evaluation
- attempt history

## Tech Stack

- Node.js
- Express
- SQLite
- better-sqlite3
- JWT
- bcryptjs

## Requirements

- Node.js 20+
- npm

## Installation

```bash
npm install (this will install all the required dependencies)

```

## Environment Variables
Create a .env file in the backend root:
```text
PORT=3000
JWT_SECRET=super-secret-key-change-me
JWT_EXPIRES_IN=1h
DB_PATH=./wisewin.db
```

## Initialize Database

```bash
npm run db:init
```
This will:

- create all tables
- create indexes
- insert seed demo data

## Run Development Server

```bash
npm run dev
```
The backend will run on:
```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
npm run start
npm run db:init
```

## Main API Areas
### Authentication
- POST /api/auth/login
- GET /api/auth/me
### Companies
- GET /api/companies
### Users
- POST /api/users
- GET /api/users
- GET /api/users/company/:companyId
- PUT /api/users/:userId/password
### Quizzes
- GET /api/quizzes
- POST /api/quizzes
### Questions
- GET /api/questions/quizzes/:quizId
- POST /api/questions/quizzes/:quizId
### Assignments
- GET /api/assignments/me
- POST /api/assignments/quizzes/:quizId
### Attempts
- POST /api/attempts/assignments/:assignmentId/start
- GET /api/attempts/:attemptId
- POST /api/attempts/:attemptId/answers
- POST /api/attempts/:attemptId/submit
- GET /api/attempts/assignments/:assignmentId/history

## Seeded Demo Users
### Administrator
- admin@wisewin.com
### Super User
- super.techflow@company.com
### Normal Users
- alice@techflow.com
- bob@techflow.com

Password for demo accounts:
```text
password123
```

## Business Rules
- Administrator does not belong to a company
- Super user belongs to one company
- User belongs to one company
- Platform quizzes are visible globally
- Company quizzes are visible only within their company
- A user answers each question once per attempt
- Users may retry if they fail
- Quiz results are based on max_wrong_answers
## Current Limitations
- No edit/delete endpoints for quizzes and questions
- Reporting endpoints are basic
- No email notifications
- Password reset for other users is not exposed via dedicated admin UI