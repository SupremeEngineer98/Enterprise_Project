WiseWin Platform

WiseWin is a role-based employee training platform developed as a team project.
Project Purpose

The platform is designed to support company employee training through quizzes.
It allows administrators and company super users to manage users, create quizzes, assign training, and monitor user progress.
Roles
Administrator

Platform-level manager.

    manages companies
    creates users and super users
    creates platform quizzes
    creates company quizzes

Super User

Company-level manager.

    manages users within own company
    creates company quizzes
    adds quiz questions
    assigns quizzes to employees

User

Employee role.

    views assigned quizzes
    completes quiz attempts
    reviews results
    checks attempt history

Repositories / Folders
Frontend

Located in:

wisewin-frontend/

Built with:

    React
    Vite
    Tailwind CSS

Backend

Located in:

wisewin-backend/

Built with:

    Node.js
    Express
    SQLite

How to Run
Backend

cd wisewin-backend
npm install
npm run dev

Frontend

cd wisewin-frontend
npm install
npm run dev

Demo Accounts

Password for all demo users:

password123

Administrator

admin@wisewin.com

Super User

super.creative@company.com

User

test.creative@company.com
steven@test.com
test2@test.com

Running Tests

The backend includes automated tests for core functionality:

    Authentication (login, current user)
    Quiz attempts (start attempt, answer submission, completion, history)

Run tests

1:move into this directory: cd Enterprise_Project/wisewin_platform/wisewin-backend/tests

2:run tests with this command:

npm test

Core Implemented Features

    JWT authentication
    role-based routing and authorization
    multi-role dashboards
    create user
    create quiz
    add questions and answers
    assign quizzes
    start and resume attempts
    answer submission
    pass/fail results
    multiple attempts
    attempt history
    change password

Scoring Model

Each quiz defines:

    maximum allowed wrong answers A user:
    answers each question once per attempt
    proceeds through the quiz
    passes if wrong answers do not exceed the allowed threshold
    retries with a new attempt if the quiz is failed

Current Limitations

    Question editing/deletion is not implemented
    Quiz editing/deactivation UI is limited
    Reporting analytics are basic
    Result page depends on navigation state
