import path from "node:path";

import { defineConfig, devices } from "@playwright/test";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: path.resolve(process.cwd(), ".env.local") });

/** Run `bun run test:e2e:save-auth` to write `tests/.auth/applicant.json`. */
export default defineConfig({
	testDir: "tests/e2e",
	testMatch: "**/auth.setup.ts",
	workers: 1,
	forbidOnly: Boolean(process.env.CI),
	reporter: "list",
	use: {
		baseURL: "http://127.0.0.1:4179",
		trace: "on-first-retry",
		...devices["Desktop Chrome"],
	},
	webServer: {
		command: "bunx vite --port=4179 --host=127.0.0.1",
		url: "http://127.0.0.1:4179",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
