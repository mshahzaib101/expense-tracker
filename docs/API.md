# Expense Tracker — API Documentation

Base URL: `http://localhost:3001`

All responses follow a consistent format. All protected endpoints require a valid JWT in an HTTP-only cookie named `token`.

---

## Response Format

### Success Response

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

### HTTP Status Codes Used

| Code | Meaning               | When                                  |
| ---- | --------------------- | ------------------------------------- |
| 200  | OK                    | Successful GET, PATCH, DELETE         |
| 201  | Created               | Successful POST (resource created)    |
| 400  | Bad Request           | Validation errors                     |
| 401  | Unauthorized          | Missing or invalid JWT                |
| 403  | Forbidden             | Valid JWT but not the resource owner  |
| 404  | Not Found             | Resource doesn't exist                |
| 409  | Conflict              | Duplicate resource (e.g., email)      |
| 429  | Too Many Requests     | Rate limit exceeded                   |
| 500  | Internal Server Error | Unexpected server error               |
| 503  | Service Unavailable   | Database connection failure           |

---

## Authentication Endpoints

### POST `/auth/register`

Create a new user account.

**Auth Required:** No

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `name`: string, required, 2–100 characters
- `email`: string, required, valid email format, unique
- `password`: string, required, minimum 8 characters

**Success Response (201):**

```json
{
  "statusCode": 201,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "clx1234...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-03-25T10:00:00.000Z"
    }
  }
}
```

**Cookie Set:** `token=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`

**Error Responses:**
- `400` — Validation failed (missing fields, short password, invalid email)
- `409` — Email already registered

---

### POST `/auth/login`

Log in with existing credentials.

**Auth Required:** No

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `email`: string, required, valid email format
- `password`: string, required

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clx1234...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-03-25T10:00:00.000Z"
    }
  }
}
```

**Cookie Set:** `token=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`

**Error Responses:**
- `400` — Validation failed
- `401` — Invalid email or password

---

### POST `/auth/logout`

Log out the current user.

**Auth Required:** Yes

**Request Body:** None

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Logged out successfully",
  "data": null
}
```

**Cookie Cleared:** `token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`

---

### GET `/auth/me`

Get the currently authenticated user's profile.

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "user": {
      "id": "clx1234...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-03-25T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401` — Not authenticated

---

## Expense Endpoints

All expense endpoints require authentication. Users can only access their own expenses.

### GET `/expenses`

List the current user's expenses with optional filters.

**Auth Required:** Yes

**Query Parameters:**

| Parameter   | Type   | Required | Description                          |
| ----------- | ------ | -------- | ------------------------------------ |
| `category`  | string | No       | Filter by category (e.g., `FOOD`)    |
| `startDate` | string | No       | Filter from date (ISO: `2026-01-01`) |
| `endDate`   | string | No       | Filter to date (ISO: `2026-03-31`)   |
| `page`      | number | No       | Page number (default: 1)             |
| `limit`     | number | No       | Items per page (default: 20, max: 100) |
| `sortBy`    | string | No       | Sort field (default: `date`)         |
| `sortOrder` | string | No       | `asc` or `desc` (default: `desc`)    |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "expenses": [
      {
        "id": "clx5678...",
        "amount": 25.50,
        "category": "FOOD",
        "date": "2026-03-25",
        "note": "Lunch with team",
        "createdAt": "2026-03-25T12:00:00.000Z",
        "updatedAt": "2026-03-25T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### POST `/expenses`

Create a new expense.

**Auth Required:** Yes

**Request Body:**

```json
{
  "amount": 25.50,
  "category": "FOOD",
  "date": "2026-03-25",
  "note": "Lunch with team"
}
```

**Validation Rules:**
- `amount`: number, required, greater than 0, max 2 decimal places
- `category`: string, required, must be a valid Category enum value
- `date`: string, required, valid ISO date format (YYYY-MM-DD)
- `note`: string, optional, max 255 characters

**Success Response (201):**

```json
{
  "statusCode": 201,
  "message": "Expense created",
  "data": {
    "expense": {
      "id": "clx5678...",
      "amount": 25.50,
      "category": "FOOD",
      "date": "2026-03-25",
      "note": "Lunch with team",
      "createdAt": "2026-03-25T12:00:00.000Z",
      "updatedAt": "2026-03-25T12:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400` — Validation failed
- `401` — Not authenticated

---

### PATCH `/expenses/:id`

Update an existing expense.

**Auth Required:** Yes

**URL Parameters:**
- `id`: string, required — the expense ID

**Request Body (all fields optional):**

```json
{
  "amount": 30.00,
  "category": "ENTERTAINMENT",
  "date": "2026-03-26",
  "note": "Updated note"
}
```

**Validation Rules:** Same as POST, but all fields are optional (partial update).

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Expense updated",
  "data": {
    "expense": {
      "id": "clx5678...",
      "amount": 30.00,
      "category": "ENTERTAINMENT",
      "date": "2026-03-26",
      "note": "Updated note",
      "createdAt": "2026-03-25T12:00:00.000Z",
      "updatedAt": "2026-03-26T08:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400` — Validation failed
- `401` — Not authenticated
- `403` — Not the owner of this expense
- `404` — Expense not found

---

### DELETE `/expenses/:id`

Delete an existing expense.

**Auth Required:** Yes

**URL Parameters:**
- `id`: string, required — the expense ID

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Expense deleted",
  "data": null
}
```

**Error Responses:**
- `401` — Not authenticated
- `403` — Not the owner of this expense
- `404` — Expense not found

---

### GET `/expenses/summary`

Get aggregated expense totals for the current user.

**Auth Required:** Yes

**Query Parameters:**

| Parameter   | Type   | Required | Description                          |
| ----------- | ------ | -------- | ------------------------------------ |
| `startDate` | string | No       | Filter from date (ISO: `2026-01-01`) |
| `endDate`   | string | No       | Filter to date (ISO: `2026-03-31`)   |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "totalAmount": 1250.75,
    "expenseCount": 45,
    "byCategory": [
      { "category": "FOOD", "totalAmount": 450.00, "count": 20 },
      { "category": "TRANSPORT", "totalAmount": 200.50, "count": 10 },
      { "category": "ENTERTAINMENT", "totalAmount": 150.25, "count": 5 },
      { "category": "BILLS", "totalAmount": 300.00, "count": 4 },
      { "category": "SHOPPING", "totalAmount": 100.00, "count": 3 },
      { "category": "HEALTH", "totalAmount": 50.00, "count": 3 }
    ]
  }
}
```

---

### GET `/expenses/export`

Export expenses as a CSV file, optionally filtered by date range.

**Auth Required:** Yes

**Rate Limit:** Global (100 req/min)

**Query Parameters:**

| Parameter   | Type   | Required | Description                          |
| ----------- | ------ | -------- | ------------------------------------ |
| `startDate` | string | No       | Filter from date (ISO: `2026-01-01`) |
| `endDate`   | string | No       | Filter to date (ISO: `2026-03-31`)   |

When no date parameters are provided, all expenses are exported.

**Success Response (200):**

Returns a CSV file download with headers:
- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename="expenses-2026-03-26.csv"`

CSV columns: `Date`, `Category`, `Amount`, `Note`

**Security:** CSV injection prevention — values starting with `=`, `+`, `-`, `@`, `\t`, `\r` are prefixed with a single-quote to prevent formula injection when opened in spreadsheet software.

**Error Responses:**
- `400` — Invalid date format (must be YYYY-MM-DD)
- `401` — Not authenticated

---

## User Settings Endpoints

All user settings endpoints require authentication and are rate-limited to 10 requests per minute to prevent brute-force attacks on password verification.

### PATCH `/users/profile`

Update the current user's display name.

**Auth Required:** Yes

**Rate Limit:** 10 req/min

**Request Body:**

```json
{
  "name": "Jane Doe"
}
```

**Validation Rules:**
- `name`: string, required, 2–100 characters, trimmed

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Profile updated",
  "data": {
    "user": {
      "id": "clx1234...",
      "name": "Jane Doe",
      "email": "john@example.com",
      "createdAt": "2026-03-25T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400` — Validation failed (name too short/long)
- `401` — Not authenticated

---

### PATCH `/users/password`

Change the current user's password. Requires current password for verification. Clears the JWT cookie after success (forces re-login).

**Auth Required:** Yes

**Rate Limit:** 10 req/min

**Request Body:**

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456",
  "confirmNewPassword": "newSecurePassword456"
}
```

**Validation Rules:**
- `currentPassword`: string, required
- `newPassword`: string, required, minimum 8 characters
- `confirmNewPassword`: string, required, must match `newPassword`

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Password changed successfully. Please log in again.",
  "data": null
}
```

**Cookie Cleared:** `token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`

**Error Responses:**
- `400` — Validation failed (short password, passwords don't match)
- `401` — Not authenticated or current password is incorrect

**Security Notes:**
- Current password is verified via Argon2id before allowing the change
- New password is hashed with Argon2id before storage
- JWT cookie is cleared to force re-authentication

---

### DELETE `/users/account`

Permanently delete the current user's account and all associated expenses. Requires password for verification. Clears the JWT cookie after success.

**Auth Required:** Yes

**Rate Limit:** 10 req/min

**Request Body:**

```json
{
  "password": "securePassword123"
}
```

**Validation Rules:**
- `password`: string, required

**Success Response (200):**

```json
{
  "statusCode": 200,
  "message": "Account deleted successfully",
  "data": null
}
```

**Cookie Cleared:** `token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`

**Error Responses:**
- `401` — Not authenticated or password is incorrect

**Security Notes:**
- Password is verified via Argon2id before deletion
- All user expenses are cascade-deleted via the database foreign key constraint
- JWT cookie is cleared immediately

---

## Cookie Configuration

The JWT is stored in an HTTP-only cookie with these properties:

| Property   | Value          | Purpose                                              |
| ---------- | -------------- | ---------------------------------------------------- |
| `name`     | `token`        | Cookie name                                          |
| `httpOnly` | `true`         | JavaScript cannot access the token (XSS protection)  |
| `secure`   | `true` in prod | Only sent over HTTPS in production                   |
| `sameSite` | `Lax`          | Sent with same-site requests + top-level navigations |
| `path`     | `/`            | Available on all paths                               |
| `maxAge`   | `604800000`    | 7 days in milliseconds (Express convention)          |

---

## CORS Configuration

```typescript
{
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,                  // allow cookies
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}
```
