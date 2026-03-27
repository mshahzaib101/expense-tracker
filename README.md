# Expense Tracker

A full-stack expense tracking application built with Next.js, NestJS, Prisma, and PostgreSQL.

It includes secure cookie-based authentication, expense CRUD, dashboard analytics, CSV export, filtering, and a responsive UI optimized for desktop and mobile.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Available Scripts](#available-scripts)
- [API Summary](#api-summary)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Recharts
- React Hook Form
- Zod

### Backend

- NestJS 11
- Prisma 7
- PostgreSQL 16
- JWT authentication
- Passport.js
- Argon2id password hashing
- Zod validation

## Features

- User registration, login, logout, and session persistence with HTTP-only cookies
- Protected dashboard routes
- Create, view, update, and delete expenses
- Filter expenses by category and date range
- Expense summary dashboard with category analytics
- CSV export
- Profile update, password change, and account deletion
- Responsive layout for mobile and desktop
- Loading states, empty states, and error handling

## Project Structure

```text
expense-tracker/
├── backend/              # NestJS API
├── frontend/             # Next.js app
├── docs/                 # Supporting documentation
├── docker-compose.yml    # Local PostgreSQL setup
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 22 LTS (or 20+)
- npm
- Docker and Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/mshahzaib101/expense-tracker.git
cd expense-tracker
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432`.

### 3. Set up the backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
```

### 4. Start the backend

```bash
npm run start:dev
```

The backend runs at [http://localhost:3001](http://localhost:3001).

### 5. Set up and start the frontend

Open a new terminal:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The frontend runs at [http://localhost:3000](http://localhost:3000).

### 6. Use the app

Open [http://localhost:3000](http://localhost:3000), create an account, and start adding expenses.

## Environment Variables

### Backend (`backend/.env`)

Copy from `backend/.env.example`. The defaults work with the included Docker Compose setup.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWTs (min 32 characters) |
| `JWT_EXPIRATION` | Yes | JWT lifetime (`7d`, `12h`, `15m`, etc.) |
| `FRONTEND_URL` | Yes | Allowed frontend origin for CORS |
| `PORT` | Yes | Backend server port |

### Frontend (`frontend/.env.local`)

Copy from `frontend/.env.example`.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL for the backend API |

## Testing

The project includes two test layers:

- **Backend**: unit and API integration tests with Jest and Supertest
- **Frontend**: browser end-to-end tests with Playwright

### Backend Tests

From `backend/`:

```bash
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

- `npm test` runs the unit test suite
- `npm run test:e2e` runs API integration tests (uses mocked Prisma, no database required)

### Frontend Browser Tests

Make sure PostgreSQL is running (`docker compose up -d`), then from `frontend/`:

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

To run with a visible browser:

```bash
npm run test:e2e:headed
```

The Playwright suite automatically starts dedicated test servers (frontend on `127.0.0.1:3100`, backend on `127.0.0.1:3101`) and uses an isolated `expense_tracker_e2e` database, so it won't interfere with your dev environment.

## Available Scripts

### Backend (`backend/`)

| Script | Description |
| --- | --- |
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Build for production |
| `npm run start:prod` | Start production build |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run API integration tests |
| `npm run lint` | Lint and fix |

### Frontend (`frontend/`)

| Script | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm start` | Start production build |
| `npm run test:e2e` | Run Playwright tests |
| `npm run test:e2e:headed` | Run Playwright tests (visible browser) |
| `npm run lint` | Lint |

## API Summary

Base URL: `http://localhost:3001`

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Log in |
| `POST` | `/auth/logout` | Log out |
| `GET` | `/auth/me` | Get current user |
| `GET` | `/expenses` | List expenses (with filters) |
| `POST` | `/expenses` | Create expense |
| `PATCH` | `/expenses/:id` | Update expense |
| `DELETE` | `/expenses/:id` | Delete expense |
| `GET` | `/expenses/summary` | Expense analytics |
| `GET` | `/expenses/export` | CSV export |
| `PATCH` | `/users/profile` | Update name |
| `PATCH` | `/users/password` | Change password |
| `DELETE` | `/users/account` | Delete account |

## Troubleshooting

### Port already in use

If `3000`, `3001`, or `5432` is already occupied, stop the conflicting process or update the related environment variable and Docker port mapping.

### Database connection issues

```bash
docker compose ps        # Check status
docker compose down      # Stop
docker compose up -d     # Restart
```

### Prisma client issues

Regenerate the client:

```bash
cd backend
npx prisma generate
```

### Playwright tests fail to start

- Ensure Docker/PostgreSQL is running
- Ensure port `5432` is available
- Run `npx playwright install chromium` in the frontend directory
- The test suite uses ports `3100`/`3101`, so it won't conflict with dev servers

## Documentation

See the [`docs/`](docs/) directory for detailed documentation:

- [Project Overview](docs/OVERVIEW.md) — architecture, design decisions, security
- [API Documentation](docs/API.md) — endpoints, request/response formats
- [Database Schema](docs/DATABASE.md) — models, relationships, indexes
- [Deployment](docs/DEPLOYMENT.md) — Vercel + Railway setup, environment variables, proxy config
- [Build Plan](docs/STEPS.md) — phased development progress
