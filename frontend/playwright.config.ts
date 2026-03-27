import { defineConfig, devices } from '@playwright/test';

const frontendBaseUrl = 'http://127.0.0.1:3100';
const backendBaseUrl = 'http://127.0.0.1:3101';
const e2eDatabaseUrl =
  'postgresql://expense_user:expense_pass@127.0.0.1:5432/expense_tracker_e2e';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: frontendBaseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run start:e2e',
      cwd: '../backend',
      url: `${backendBaseUrl}/health/ready`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        DATABASE_URL: e2eDatabaseUrl,
        JWT_SECRET: '12345678901234567890123456789012',
        JWT_EXPIRATION: '7d',
        FRONTEND_URL: frontendBaseUrl,
        PORT: '3101',
        NODE_ENV: 'test',
      },
    },
    {
      command: 'next dev --hostname 127.0.0.1 --port 3100',
      cwd: '.',
      url: frontendBaseUrl,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        NEXT_E2E: '1',
        NEXT_PUBLIC_API_URL: backendBaseUrl,
      },
    },
  ],
});
