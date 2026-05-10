# WiseWin Frontend

Frontend application for the WiseWin employee training platform.

## Overview

WiseWin is a role-based web platform for employee training management.  
The frontend supports three main roles:

- Administrator
- Super user
- User

The application allows:
- user authentication
- role-based dashboard access
- quiz creation
- question management
- quiz assignment
- quiz execution
- result tracking
- attempt history review

## Tech Stack

- React
- Vite
- React Router
- Axios
- Tailwind CSS

## Requirements

- Node.js 20+
- npm

## Installation

```bash
npm install
```

## Environment Variables

Create a .env file in the project root:
```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

## Run Development Server

```bash
npm run dev
```
The frontend will run on:
```text
http://localhost:5173
```

## Main Features

### Administrator
- View platform dashboard
- Create users and super users
- Create platform quizzes
- Create company quizzes
- Add quiz questions
- Change own password
### Super User
- View company dashboard
- Create users for own company
- Create company quizzes
- Add quiz questions
- Assign quizzes to company users
- Change own password
### User
- View assigned quizzes
- Start and resume quiz attempts
- Submit quiz answers
- View pass/fail results
- View attempt history
- Change own password

## Project Structure

```text
src/
  app/
  components/
  context/
  pages/
  services/
  styles/
  utils/
```

## Notes

- The frontend depends on the backend API being available.
- Role-based redirects are handled after login.
- Quiz result pages currently use navigation state.
- All major flows are connected to the real backend.

## Demo Roles

Use backend seeded users to test the UI.

### Example accounts:

- admin@wisewin.com
- super.creative@company.com
- test.creative@company.com
- steven@test.com
- test2@test.com

### Password:
```text
password123
```

## Current Limitations

- Edit/delete functionality for quizzes and questions is not implemented.
- Reporting visualizations are basic.
- Result page is not directly reload-persistent without extra fetch logic.