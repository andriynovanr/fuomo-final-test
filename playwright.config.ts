import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // reporter: HTML buat visual review, JUnit buat CI parsing
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit-report.xml' }],
  ],

  use: {
    // base URL dari env variable, fallback ke staging
    baseURL: process.env.BASE_URL || 'https://fe-stage.fuomo.id',
    trace: 'on-first-retry',
    // otomatis screenshot kalau test gagal — berguna untuk debugging
    screenshot: 'only-on-failure',
  },

  projects: [
    // === Desktop browsers ===
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // === Mobile viewports (Scenario 4: responsive test) ===
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
