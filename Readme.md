# Task Manager

A web-based task management application designed for both individuals and teams. Manage your projects and tasks efficiently by assigning work, attaching files, and keeping notes. The app supports collaborative as well as private workflows.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://web.postman.co/workspace/My-Workspace~8e34ee0b-2a3b-4de6-82f5-3528760f0bd7/collection/40785574-579929ee-8591-455d-854a-daa680c4e898?action=share&creator=40785574)

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Code Style & Linting](#code-style--linting)
- [License](#license)

---

## Overview

Task Manager is a backend service for managing users, projects, tasks, and notes. It supports user authentication, project collaboration, task assignment, note-taking, file uploads (via Cloudinary), and email notifications. Designed for scalability and maintainability.

## ✨ Features

### 🗂️ Projects & Tasks
- Create and manage multiple projects.
- Add tasks to projects and assign them to team members.
- Tasks can include **subtasks** for better breakdown and tracking.

### ✅ Subtasks
- Break down complex tasks into smaller units.
- Each subtask has its own title and description.

### 📝 Notes
- Attach notes to projects and tasks.
- **Admin-created notes** are visible to all members.
- **Member-created notes** are private to the creator.
- Only the creator can edit their notes.

### 📎 Attachments
- Attach files to projects and tasks using Cloudinary.

### 🔐 Permissions
- **Admins** can edit project details and public notes.
- **Members** can only edit the notes they’ve created.

## Tech Stack
- **Node.js** / **Express.js**
- **MongoDB** (Mongoose)
- **JWT** for authentication
- **Cloudinary** for file uploads
- **Nodemailer** & **Mailgen** for emails
- **Jest**, **Supertest** for testing
- **Prettier**, **ESLint** for code style

## Project Structure
```
task_manager/
├── src/
│   ├── app.js                # Express app setup
│   ├── index.js              # Entry point
│   ├── controllers/          # Route controllers
│   ├── db/                   # Database connection
│   ├── middleswares/         # Custom middleware
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── utils/                # Utility functions
│   └── validators/           # Input validators
├── frontend/                 # (currently working) Frontend code
├── files/                    # Uploaded files or assets
├── .env                      # Environment variables
├── package.json              # NPM dependencies & scripts
├── jest.config.mjs           # Jest config
├── Readme.md                 # This file
└── ...
```

## Installation & Setup
1. **Clone the repository:**
   ```bash
   git clone "https://github.com/Gold-1234/task-manager"
   cd task_manager
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in the required values (see below).

## Environment Variables
Create a `.env` file in the root directory. Example variables:
```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
CORS_ORIGIN=http://localhost:8000
```

## Running the App
- **Development:**
  ```bash
  npm run dev
  ```
- The server runs on the port specified in `.env` (default: 8000).

## API Endpoints
All endpoints are prefixed with `/api/v1/`.

| Resource   | Route Prefix          | Description               |
|------------|----------------------|---------------------------|
| Health     | `/healthcheck`        | Health check endpoint     |
| Auth       | `/auth`               | User auth (register/login)|
| Project    | `/project`            | Project management        |
| Task       | `/task`               | Task management           |
| Note       | `/note`               | Notes management          |

- **Example:** `POST /api/v1/auth/login`
- Each route supports standard REST actions (GET, POST, PUT, DELETE) as appropriate.

For detailed API documentation, including request/response formats and authentication, see [API_DOCS.md](./API_DOCS.md).

## Testing
- **Run tests:**
  ```bash
  npm test
  ```
- Uses Jest and Supertest for unit and integration testing.

## Code Style & Linting
- **Format code:**
  ```bash
  npm run format
  ```
- **Lint code:**
  ESLint is configured via `.eslintrc` and Prettier via `.prettierrc`.

---

For questions or support, please open an issue on the repository.
