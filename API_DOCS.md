# API Documentation

[![Run in Postman](https://run.pstmn.io/button.svg)](https://.postman.co/workspace/My-Workspace~8e34ee0b-2a3b-4de6-82f5-3528760f0bd7/collection/40785574-579929ee-8591-455d-854a-daa680c4e898?action=share&creator=40785574)

All endpoints are prefixed with `/api/v1/`

---

## Authentication Routes (`/auth`)

| Method | Endpoint                       | Description                       | Auth Required | Body/Params                    |
|--------|-------------------------------|-----------------------------------|--------------|-------------------------------|
| POST   | `/register/`                  | Register a new user               | No           | `{ name, email, password }`    |
| POST   | `/login/`                     | Login user                        | No           | `{ email, password }`          |
| GET    | `/verify-email/:unhashedToken`| Verify email                      | Yes          | URL param                      |
| GET    | `/resend-email/`              | Resend verification email         | Yes          | None                           |
| GET    | `/logout/`                    | Logout user                       | Yes          | None                           |
| GET    | `/reset-password/`            | Request password reset            | No           | Query param: `email`           |
| POST   | `/reset-password/:unhashedToken`| Reset forgotten password         | No           | `{ newPassword }`              |
| POST   | `/change-password`            | Change current password           | Yes          | `{ oldPassword, newPassword }` |
| GET    | `/user`                       | Get current user info             | Yes          | None                           |
| GET    | `/refreshToken`               | Refresh access token              | Yes          | None                           |

---

## Healthcheck Route (`/healthcheck`)

| Method | Endpoint | Description         | Auth Required | Body/Params |
|--------|----------|---------------------|--------------|-------------|
| GET    | `/`      | Health check status | No           | None        |

---

## Project Routes (`/project`)

| Method | Endpoint             | Description                        | Auth Required | Body/Params                                 |
|--------|----------------------|------------------------------------|--------------|---------------------------------------------|
| GET    | `/`                  | Get all projects (member/admin)    | Yes          | None                                        |
| GET    | `/myProjects`        | Get projects by current user       | Yes          | None                                        |
| GET    | `/:id`               | Get project by ID                  | Yes          | URL param                                   |
| POST   | `/create`            | Create a new project               | Yes          | `{ name, description, ... }`                |
| PATCH  | `/update/:id`        | Update a project                   | Yes (admin)  | URL param, body with fields to update       |
| DELETE | `/delete/:id`        | Delete a project                   | Yes (admin)  | URL param                                   |
| GET    | `/members/:id`       | Get members of a project           | Yes          | URL param                                   |
| POST   | `/add_member/:id`    | Add member to a project            | Yes (admin)  | URL param, `{ userId, role }`               |
| PATCH  | `/update_member/:id` | Update member role in a project    | Yes (admin)  | URL param, `{ userId, newRole }`            |
| DELETE | `/delete_member/:id` | Remove member from a project       | Yes (admin)  | URL param, `{ userId }`                     |

---

## Task Routes (`/task`)

| Method | Endpoint                   | Description                         | Auth Required | Body/Params                                  |
|--------|----------------------------|-------------------------------------|--------------|----------------------------------------------|
| GET    | `/`                        | Get all tasks for current user      | Yes          | None                                         |
| GET    | `/:id`                     | Get tasks for a project             | Yes          | URL param                                    |
| GET    | `/:id`                     | Get task by ID                      | Yes          | URL param                                    |
| POST   | `/create/:id`              | Create a task for project           | Yes (admin)  | URL param, `{ title, description, ... }`     |
| PATCH  | `/update/:id`              | Update a task                       | Yes (admin)  | URL param, body with fields to update        |
| DELETE | `/delete/:id`              | Delete a task                       | Yes (admin)  | URL param                                    |
| GET    | `/:id`                     | Get subtask by ID                   | Yes          | URL param                                    |
| POST   | `/create-subTask/:id`      | Create a subtask                    | Yes          | URL param, `{ title, ... }`                  |
| PATCH  | `/update-subTask/:id`      | Update a subtask                    | Yes (admin)  | URL param, body with fields to update        |
| DELETE | `/delete-subTask/:id`      | Delete a subtask                    | Yes (admin)  | URL param                                    |

---

## Note Routes (`/note`)

| Method | Endpoint                | Description                          | Auth Required | Body/Params                                 |
|--------|-------------------------|--------------------------------------|--------------|---------------------------------------------|
| GET    | `/:id`                  | Get all notes for a project          | Yes          | URL param                                   |
| GET    | `/id/:id`               | Get note by ID                       | Yes          | URL param                                   |
| POST   | `/create-note/:id`      | Create a note for a project          | Yes          | URL param, `{ content, ... }`               |
| PATCH  | `/update/:id`           | Update a note                        | Yes          | URL param, body with fields to update       |
| DELETE | `/delete/:id`           | Delete a note                        | Yes          | URL param                                   |

---

## Common Response Format

All responses are in JSON format. Example:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

---

## Authentication
- Most endpoints require a valid JWT token in the `Authorization` header as `Bearer <token>`.

---

## Error Handling
- Errors return JSON with `success: false` and an error message.


> For questions or support, see the main README or open an issue.
