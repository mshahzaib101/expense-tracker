import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { configureApp } from '../src/app.setup';
import { resetEnvCache } from '../src/config/env';
import { PrismaService } from '../src/prisma/prisma.service';

type AppModuleType = typeof import('../src/app.module').AppModule;

type UserRecord = {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

type ExpenseRecord = {
  id: string;
  amount: number;
  category: string;
  date: Date;
  note: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

const originalEnv = process.env;

process.env = {
  ...originalEnv,
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  JWT_SECRET: '12345678901234567890123456789012',
  JWT_EXPIRATION: '7d',
  FRONTEND_URL: 'http://localhost:3000',
  NODE_ENV: 'test',
};
resetEnvCache();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AppModule } = require('../src/app.module') as {
  AppModule: AppModuleType;
};

function normalizeDate(value: Date | string) {
  if (typeof value === 'string') {
    return new Date(`${value}T00:00:00.000Z`);
  }
  return new Date(value);
}

function cloneUser(user: UserRecord) {
  return {
    ...user,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };
}

function cloneExpense(expense: ExpenseRecord) {
  return {
    ...expense,
    date: new Date(expense.date),
    createdAt: new Date(expense.createdAt),
    updatedAt: new Date(expense.updatedAt),
  };
}

function matchesDateRange(
  value: Date,
  filter?: { gte?: Date; lte?: Date },
) {
  if (!filter) {
    return true;
  }

  const normalizedValue = normalizeDate(value);
  if (filter.gte && normalizedValue < normalizeDate(filter.gte)) {
    return false;
  }
  if (filter.lte && normalizedValue > normalizeDate(filter.lte)) {
    return false;
  }
  return true;
}

function createPrismaMock() {
  let userCounter = 0;
  let expenseCounter = 0;
  const users: UserRecord[] = [];
  const expenses: ExpenseRecord[] = [];

  const prisma = {
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    user: {
      findUnique: jest.fn(
        async ({
          where,
        }: {
          where: { id?: string; email?: string };
        }) => {
          if (where.id) {
            const user = users.find((entry) => entry.id === where.id);
            return user ? cloneUser(user) : null;
          }

          if (where.email) {
            const user = users.find((entry) => entry.email === where.email);
            return user ? cloneUser(user) : null;
          }

          return null;
        },
      ),
      create: jest.fn(
        async ({
          data,
        }: {
          data: { email: string; name: string; password: string };
        }) => {
          const user: UserRecord = {
            id: `user-${++userCounter}`,
            email: data.email,
            name: data.name,
            password: data.password,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          users.push(user);
          return cloneUser(user);
        },
      ),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: Partial<Pick<UserRecord, 'name' | 'password'>>;
        }) => {
          const user = users.find((entry) => entry.id === where.id);
          if (!user) {
            throw new Error('User not found');
          }
          if (data.name !== undefined) {
            user.name = data.name;
          }
          if (data.password !== undefined) {
            user.password = data.password;
          }
          user.updatedAt = new Date();
          return cloneUser(user);
        },
      ),
      delete: jest.fn(async ({ where }: { where: { id: string } }) => {
        const index = users.findIndex((entry) => entry.id === where.id);
        if (index === -1) {
          throw new Error('User not found');
        }
        const [deletedUser] = users.splice(index, 1);
        for (let i = expenses.length - 1; i >= 0; i -= 1) {
          if (expenses[i].userId === deletedUser.id) {
            expenses.splice(i, 1);
          }
        }
        return cloneUser(deletedUser);
      }),
    },
    expense: {
      create: jest.fn(
        async ({
          data,
        }: {
          data: {
            amount: number;
            category: string;
            date: Date;
            note?: string | null;
            userId: string;
          };
        }) => {
          const expense: ExpenseRecord = {
            id: `expense-${++expenseCounter}`,
            amount: Number(data.amount),
            category: data.category,
            date: normalizeDate(data.date),
            note: data.note ?? null,
            userId: data.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          expenses.push(expense);
          return cloneExpense(expense);
        },
      ),
      findMany: jest.fn(
        async ({
          where,
          orderBy,
          skip = 0,
          take,
        }: {
          where?: {
            userId?: string;
            category?: string;
            date?: { gte?: Date; lte?: Date };
          };
          orderBy?:
            | Record<string, 'asc' | 'desc'>
            | { _sum?: { amount: 'asc' | 'desc' } };
          skip?: number;
          take?: number;
        }) => {
          let result = expenses.filter((expense) => {
            if (where?.userId && expense.userId !== where.userId) {
              return false;
            }
            if (where?.category && expense.category !== where.category) {
              return false;
            }
            return matchesDateRange(expense.date, where?.date);
          });

          if (orderBy) {
            const [field, direction] = Object.entries(orderBy)[0] as [
              keyof ExpenseRecord,
              'asc' | 'desc',
            ];
            result = [...result].sort((a, b) => {
              const left =
                field === 'amount'
                  ? a.amount
                  : field === 'category'
                    ? a.category
                    : field === 'createdAt'
                      ? a.createdAt.getTime()
                      : a.date.getTime();
              const right =
                field === 'amount'
                  ? b.amount
                  : field === 'category'
                    ? b.category
                    : field === 'createdAt'
                      ? b.createdAt.getTime()
                      : b.date.getTime();

              if (left < right) {
                return direction === 'asc' ? -1 : 1;
              }
              if (left > right) {
                return direction === 'asc' ? 1 : -1;
              }
              return 0;
            });
          }

          const sliced = result.slice(skip, take ? skip + take : undefined);
          return sliced.map(cloneExpense);
        },
      ),
      count: jest.fn(
        async ({
          where,
        }: {
          where?: {
            userId?: string;
            category?: string;
            date?: { gte?: Date; lte?: Date };
          };
        }) =>
          expenses.filter((expense) => {
            if (where?.userId && expense.userId !== where.userId) {
              return false;
            }
            if (where?.category && expense.category !== where.category) {
              return false;
            }
            return matchesDateRange(expense.date, where?.date);
          }).length,
      ),
      findFirst: jest.fn(
        async ({
          where,
        }: {
          where: { id: string; userId: string };
        }) => {
          const expense = expenses.find(
            (entry) => entry.id === where.id && entry.userId === where.userId,
          );
          return expense ? cloneExpense(expense) : null;
        },
      ),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: Partial<{
            amount: number;
            category: string;
            date: Date;
            note: string | null;
          }>;
        }) => {
          const expense = expenses.find((entry) => entry.id === where.id);
          if (!expense) {
            throw new Error('Expense not found');
          }
          if (data.amount !== undefined) {
            expense.amount = Number(data.amount);
          }
          if (data.category !== undefined) {
            expense.category = data.category;
          }
          if (data.date !== undefined) {
            expense.date = normalizeDate(data.date);
          }
          if (data.note !== undefined) {
            expense.note = data.note;
          }
          expense.updatedAt = new Date();
          return cloneExpense(expense);
        },
      ),
      delete: jest.fn(async ({ where }: { where: { id: string } }) => {
        const index = expenses.findIndex((entry) => entry.id === where.id);
        if (index === -1) {
          throw new Error('Expense not found');
        }
        const [deletedExpense] = expenses.splice(index, 1);
        return cloneExpense(deletedExpense);
      }),
      aggregate: jest.fn(
        async ({
          where,
        }: {
          where?: { userId?: string; date?: { gte?: Date; lte?: Date } };
        }) => {
          const filtered = expenses.filter((expense) => {
            if (where?.userId && expense.userId !== where.userId) {
              return false;
            }
            return matchesDateRange(expense.date, where?.date);
          });

          const totalAmount = filtered.reduce(
            (sum, expense) => sum + expense.amount,
            0,
          );

          return {
            _sum: {
              amount:
                filtered.length > 0
                  ? {
                      toNumber: () => totalAmount,
                    }
                  : null,
            },
            _count: filtered.length,
          };
        },
      ),
      groupBy: jest.fn(
        async ({
          where,
        }: {
          by: ['category'];
          where?: { userId?: string; date?: { gte?: Date; lte?: Date } };
          _sum: { amount: true };
          _count: true;
          orderBy: { _sum: { amount: 'asc' | 'desc' } };
        }) => {
          const filtered = expenses.filter((expense) => {
            if (where?.userId && expense.userId !== where.userId) {
              return false;
            }
            return matchesDateRange(expense.date, where?.date);
          });

          const grouped = new Map<
            string,
            { category: string; totalAmount: number; count: number }
          >();

          for (const expense of filtered) {
            const entry = grouped.get(expense.category) ?? {
              category: expense.category,
              totalAmount: 0,
              count: 0,
            };
            entry.totalAmount += expense.amount;
            entry.count += 1;
            grouped.set(expense.category, entry);
          }

          return [...grouped.values()]
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .map((entry) => ({
              category: entry.category,
              _sum: {
                amount: {
                  toNumber: () => entry.totalAmount,
                },
              },
              _count: entry.count,
            }));
        },
      ),
    },
  };

  return { prisma, users, expenses };
}

describe('App (e2e)', () => {
  let app: INestApplication<App>;
  let prismaMock: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock.prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  afterAll(() => {
    process.env = originalEnv;
    resetEnvCache();
  });

  it('returns a liveness response', async () => {
    await request(app.getHttpServer()).get('/health/live').expect(200);
  });

  it('returns a readiness response', async () => {
    await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200)
      .expect(({ body }: { body: { data: { database: string } } }) => {
        expect(body.data.database).toBe('up');
      });
  });

  it('rejects untrusted origins for state-changing requests', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('Origin', 'https://evil.example')
      .send({
        email: 'user@example.com',
        password: 'password123',
      })
      .expect(403)
      .expect({
        statusCode: 403,
        message: 'Request origin is not allowed.',
      });
  });

  it('supports the full auth flow', async () => {
    const agent = request.agent(app.getHttpServer());

    const registerResponse = await agent
      .post('/auth/register')
      .set('Origin', 'http://localhost:3000')
      .send({
        name: 'Ada Lovelace',
        email: 'Ada@Example.com',
        password: 'password123',
      })
      .expect(201);

    expect(registerResponse.body.data.user).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      }),
    );
    expect(registerResponse.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('token=')]),
    );

    await agent.get('/auth/me').expect(200).expect(({ body }) => {
      expect(body.data.user.email).toBe('ada@example.com');
      expect(body.data.user.name).toBe('Ada Lovelace');
    });

    await agent.post('/auth/logout').set('Origin', 'http://localhost:3000').expect(200);

    await agent.get('/auth/me').expect(401);
  });

  it('rejects duplicate registration and invalid login credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('Origin', 'http://localhost:3000')
      .send({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'password123',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .set('Origin', 'http://localhost:3000')
      .send({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'password123',
      })
      .expect(409)
      .expect({
        statusCode: 409,
        message: 'Email already registered',
      });

    await request(app.getHttpServer())
      .post('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .send({
        email: 'ada@example.com',
        password: 'wrong-password',
      })
      .expect(401)
      .expect({
        statusCode: 401,
        message: 'Invalid email or password',
      });
  });

  it('validates auth payloads', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('Origin', 'http://localhost:3000')
      .send({
        name: 'A',
        email: 'not-an-email',
        password: 'short',
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.message).toBe('Validation failed');
        expect(body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: 'Name must be at least 2 characters',
            }),
            expect.objectContaining({
              field: 'email',
              message: 'Invalid email format',
            }),
            expect.objectContaining({
              field: 'password',
              message: 'Password must be at least 8 characters',
            }),
          ]),
        );
      });
  });

  it('supports expense CRUD, filtering, summary, and export for the authenticated user only', async () => {
    const owner = request.agent(app.getHttpServer());
    const outsider = request.agent(app.getHttpServer());

    await owner
      .post('/auth/register')
      .set('Origin', 'http://localhost:3000')
      .send({
        name: 'Owner',
        email: 'owner@example.com',
        password: 'password123',
      })
      .expect(201);

    await outsider
      .post('/auth/register')
      .set('Origin', 'http://localhost:3000')
      .send({
        name: 'Outsider',
        email: 'outsider@example.com',
        password: 'password123',
      })
      .expect(201);

    const grocery = await owner
      .post('/expenses')
      .set('Origin', 'http://localhost:3000')
      .send({
        amount: 42.5,
        category: 'FOOD',
        date: '2026-03-20',
        note: 'Groceries',
      })
      .expect(201);

    const ticket = await owner
      .post('/expenses')
      .set('Origin', 'http://localhost:3000')
      .send({
        amount: 15,
        category: 'TRANSPORT',
        date: '2026-03-21',
        note: '=SUM(A1:A2)',
      })
      .expect(201);

    await outsider
      .post('/expenses')
      .set('Origin', 'http://localhost:3000')
      .send({
        amount: 100,
        category: 'OTHER',
        date: '2026-03-22',
        note: 'Private',
      })
      .expect(201);

    await owner
      .get('/expenses')
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.expenses).toHaveLength(2);
        expect(body.data.pagination).toEqual({
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        });
      });

    await owner
      .get('/expenses?category=FOOD&startDate=2026-03-19&endDate=2026-03-20')
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.expenses).toHaveLength(1);
        expect(body.data.expenses[0].category).toBe('FOOD');
      });

    await owner
      .get('/expenses/summary?startDate=2026-03-01&endDate=2026-03-31')
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.totalAmount).toBe(57.5);
        expect(body.data.expenseCount).toBe(2);
        expect(body.data.byCategory).toEqual([
          { category: 'FOOD', totalAmount: 42.5, count: 1 },
          { category: 'TRANSPORT', totalAmount: 15, count: 1 },
        ]);
      });

    await outsider
      .patch(`/expenses/${grocery.body.data.expense.id}`)
      .set('Origin', 'http://localhost:3000')
      .send({
        note: 'Hacked',
      })
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'Expense not found',
      });

    await owner
      .patch(`/expenses/${ticket.body.data.expense.id}`)
      .set('Origin', 'http://localhost:3000')
      .send({
        amount: 18.75,
        note: 'Train ride',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.expense.amount).toBe(18.75);
        expect(body.data.expense.note).toBe('Train ride');
      });

    await owner
      .get('/expenses/export?startDate=2026-03-01&endDate=2026-03-31')
      .expect(200)
      .expect('Content-Type', /text\/csv/)
      .expect('Content-Disposition', /attachment; filename="expenses-/)
      .expect(({ text }) => {
        expect(text).toContain('Date,Category,Amount,Note');
        expect(text).toContain('2026-03-20,FOOD,42.5,Groceries');
        expect(text).toContain(`2026-03-21,TRANSPORT,18.75,Train ride`);
      });

    await owner
      .delete(`/expenses/${grocery.body.data.expense.id}`)
      .set('Origin', 'http://localhost:3000')
      .expect(200);

    await owner.get('/expenses').expect(200).expect(({ body }) => {
      expect(body.data.expenses).toHaveLength(1);
      expect(body.data.expenses[0].id).toBe(ticket.body.data.expense.id);
    });
  });

  it('sanitizes csv export rows that begin with spreadsheet formula characters', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/auth/register')
      .set('Origin', 'http://localhost:3000')
      .send({
        name: 'CSV User',
        email: 'csv@example.com',
        password: 'password123',
      })
      .expect(201);

    await agent
      .post('/expenses')
      .set('Origin', 'http://localhost:3000')
      .send({
        amount: 20,
        category: 'OTHER',
        date: '2026-03-26',
        note: '=cmd|\' /C calc\'!A0',
      })
      .expect(201);

    await agent
      .get('/expenses/export')
      .expect(200)
      .expect(({ text }) => {
        expect(text).toContain(`"'=cmd|' /C calc'!A0`);
      });
  });

  it('supports profile updates, password changes, and account deletion', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/auth/register')
      .set('Origin', 'http://localhost:3000')
      .send({
        name: 'Grace Hopper',
        email: 'grace@example.com',
        password: 'password123',
      })
      .expect(201);

    await agent
      .patch('/users/profile')
      .set('Origin', 'http://localhost:3000')
      .send({ name: 'Rear Admiral Grace Hopper' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.user.name).toBe('Rear Admiral Grace Hopper');
      });

    await agent
      .patch('/users/password')
      .set('Origin', 'http://localhost:3000')
      .send({
        currentPassword: 'password123',
        newPassword: 'new-password-123',
        confirmNewPassword: 'new-password-123',
      })
      .expect(200)
      .expect(({ body, headers }) => {
        expect(body.message).toBe(
          'Password changed successfully. Please log in again.',
        );
        expect(headers['set-cookie']).toEqual(
          expect.arrayContaining([expect.stringContaining('token=;')]),
        );
      });

    await agent.get('/auth/me').expect(401);

    await request(app.getHttpServer())
      .post('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .send({
        email: 'grace@example.com',
        password: 'password123',
      })
      .expect(401);

    await agent
      .post('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .send({
        email: 'grace@example.com',
        password: 'new-password-123',
      })
      .expect(200);

    await agent
      .delete('/users/account')
      .set('Origin', 'http://localhost:3000')
      .send({
        password: 'new-password-123',
      })
      .expect(200);

    await agent.get('/auth/me').expect(401);

    await request(app.getHttpServer())
      .post('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .send({
        email: 'grace@example.com',
        password: 'new-password-123',
      })
      .expect(401);
  });

  it('rejects protected routes without a session', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
    await request(app.getHttpServer()).get('/expenses').expect(401);
    await request(app.getHttpServer()).patch('/users/profile').expect(401);
  });
});
