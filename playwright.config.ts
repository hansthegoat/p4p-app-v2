import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  timeout: 30000,

  use: {
    baseURL: "http://localhost:8081/p4p-app-v2/",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    headless: true,
  },

  projects: [
    {
      name: "setup-hr",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "setup-supervisor",
      testMatch: /auth\.setup\.supervisor\.ts/,
    },
    {
      name: "unauthed",
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "authed-hr",
      testMatch: /authed\/hr\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/.auth/hr.json",
      },
      dependencies: ["setup-hr"],
    },
    {
      name: "authed-supervisor",
      testMatch: /authed\/supervisor\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/.auth/supervisor.json",
      },
      dependencies: ["setup-supervisor"],
    },
  ],
});