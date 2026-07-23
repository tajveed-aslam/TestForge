import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";
const API_URL      = process.env.API_URL      ?? "http://localhost:8000";

export default defineConfig({
  testDir:        "./specs",
  fullyParallel:  false,
  workers:        1,
  retries:        process.env.CI ? 1 : 0,
  timeout:        45_000,
  reporter:       [["list"], ["html", { open: "never" }]],

  projects: [
    {
      name: "api",
      testDir: "./specs/api",
      use: { baseURL: API_URL },
    },
    {
      name: "ui",
      testDir: "./specs/ui",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: FRONTEND_URL,
        screenshot: "only-on-failure",
        trace:      "retain-on-failure",
      },
    },
  ],
});
