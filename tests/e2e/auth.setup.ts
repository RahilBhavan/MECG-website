import { test as setup } from "@playwright/test";

import { signInWithPassword } from "./helpers/sign-in";

/**
 * Export applicant session for faster local runs.
 * Usage (with Supabase configured in Vite):
 * `E2E_APPLICANT_EMAIL=... E2E_APPLICANT_PASSWORD=... bun run test:e2e:save-auth`
 * Then point `storageState` in a custom Playwright project at `tests/.auth/applicant.json`.
 */
setup("save applicant storageState", async ({ page }) => {
	const email = process.env.E2E_APPLICANT_EMAIL?.trim();
	const password = process.env.E2E_APPLICANT_PASSWORD?.trim();
	if (!email || !password) {
		throw new Error(
			"Set E2E_APPLICANT_EMAIL and E2E_APPLICANT_PASSWORD to export storage.",
		);
	}
	await signInWithPassword(page, email, password);
	await page.context().storageState({ path: "tests/.auth/applicant.json" });
});
