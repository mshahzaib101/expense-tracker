# Expense Tracker — Database Schema

Database: **PostgreSQL 16** via **Docker Compose**
ORM: **Prisma** (latest)

---

## Entity Relationship Diagram

```
┌──────────────────────────┐       ┌──────────────────────────────┐
│          User            │       │          Expense             │
├──────────────────────────┤       ├──────────────────────────────┤
│ id        String (cuid)  │ PK    │ id        String (cuid)      │ PK
│ email     String         │ UQ    │ amount    Decimal(10,2)      │
│ name      String         │       │ category  Category (enum)    │
│ password  String         │       │ date      DateTime           │
│ createdAt DateTime       │       │ note      String?            │
│ updatedAt DateTime       │       │ userId    String             │ FK → User.id
└──────────┬───────────────┘       │ createdAt DateTime           │
           │                       │ updatedAt DateTime           │
           │  1 ────────── *       └──────────────────────────────┘
           │
           └── One user has many expenses
```

---

## Prisma Schema

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
}
```

> **Prisma v7 Note:** The database URL is no longer defined in `schema.prisma`.
> It is configured in `backend/prisma.config.ts` via `defineConfig()`:
>
> ```typescript
> import { defineConfig } from 'prisma/config';
>
> export default defineConfig({
>   earlyAccess: true,
>   schema: './prisma/schema.prisma',
>   datasource: { url: process.env['DATABASE_URL']! },
> });
> ```

```prisma

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String
  password  String
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  expenses  Expense[]

  @@map("users")
}

model Expense {
  id        String   @id @default(cuid())
  amount    Decimal  @db.Decimal(10, 2)
  category  Category
  date      DateTime @db.Date
  note      String?  @db.VarChar(255)
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, date])
  @@index([userId, category])
  @@map("expenses")
}

enum Category {
  FOOD
  TRANSPORT
  ENTERTAINMENT
  SHOPPING
  BILLS
  HEALTH
  EDUCATION
  OTHER
}
```

---

## Table Details

### `users`

| Column       | Type         | Constraints                  | Notes                        |
| ------------ | ------------ | ---------------------------- | ---------------------------- |
| `id`         | `String`     | PK, cuid()                   | Auto-generated unique ID     |
| `email`      | `String`     | Unique                       | Stored lowercase             |
| `name`       | `String`     | Not null                     | User's display name          |
| `password`   | `String`     | Not null                     | Argon2id hash (never plain)  |
| `created_at` | `DateTime`   | Default: now()               | Account creation timestamp   |
| `updated_at` | `DateTime`   | Auto-updated                 | Last modification timestamp  |

### `expenses`

| Column       | Type           | Constraints                | Notes                                |
| ------------ | -------------- | -------------------------- | ------------------------------------ |
| `id`         | `String`       | PK, cuid()                 | Auto-generated unique ID             |
| `amount`     | `Decimal(10,2)`| Not null                   | Supports up to 99,999,999.99         |
| `category`   | `Category`     | Not null, enum             | One of the pre-defined categories    |
| `date`       | `Date`         | Not null                   | The date the expense occurred        |
| `note`       | `VarChar(255)` | Nullable                   | Optional description                 |
| `user_id`    | `String`       | FK → users.id, Not null    | The user who owns this expense       |
| `created_at` | `DateTime`     | Default: now()             | Record creation timestamp            |
| `updated_at` | `DateTime`     | Auto-updated               | Last modification timestamp          |

---

## Indexes

| Table      | Columns              | Purpose                                         |
| ---------- | -------------------- | ----------------------------------------------- |
| `users`    | `email` (unique)     | Fast login lookup, prevent duplicates           |
| `expenses` | `user_id`            | Fast lookup of all expenses for a user          |
| `expenses` | `user_id, date`      | Efficient date range filtering per user         |
| `expenses` | `user_id, category`  | Efficient category filtering per user           |

---

## Relationships

| Relationship     | Type     | Description                              | On Delete |
| ---------------- | -------- | ---------------------------------------- | --------- |
| User → Expenses  | One-Many | A user can have many expenses            | Cascade   |
| Expense → User   | Many-One | Each expense belongs to exactly one user | —         |

**Cascade delete:** When a user is deleted, all their expenses are automatically deleted.

---

## Category Enum Values

| Enum Value      | Display Label     | Description                         |
| --------------- | ----------------- | ----------------------------------- |
| `FOOD`          | Food              | Meals, groceries, dining out        |
| `TRANSPORT`     | Transport         | Fuel, public transit, ride-sharing  |
| `ENTERTAINMENT` | Entertainment     | Movies, games, events, streaming    |
| `SHOPPING`      | Shopping          | Clothing, electronics, online buys  |
| `BILLS`         | Bills & Utilities | Rent, electricity, water, internet  |
| `HEALTH`        | Health            | Medical, pharmacy, gym, wellness    |
| `EDUCATION`     | Education         | Courses, books, tuition, supplies   |
| `OTHER`         | Other             | Anything not covered above          |

---

## Data Integrity Rules

1. **Email uniqueness** — enforced at the database level via unique constraint
2. **Amount precision** — `Decimal(10,2)` prevents floating-point rounding issues
3. **Referential integrity** — `user_id` FK ensures expenses always reference a valid user
4. **Cascade deletion** — deleting a user removes all their expense data
5. **Column mapping** — Prisma models use camelCase, database columns use snake_case via `@map()`
6. **Table mapping** — Model names are PascalCase, table names are lowercase plural via `@@map()`

---

## Migration Workflow

```bash
# After modifying schema.prisma:
npx prisma migrate dev --name descriptive_name

# Apply migrations in production:
npx prisma migrate deploy

# Reset database (development only):
npx prisma migrate reset

# View current database in browser:
npx prisma studio
```
