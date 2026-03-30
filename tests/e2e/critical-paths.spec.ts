import { expect, test } from "@playwright/test";

import { signInWithPassword } from "./helpers/sign-in";

function creds(
	emailVar: string,
	passVar: string,
): { email: string; password: string } | null {
	const email = process.env[emailVar]?.trim();
	const password = process.env[passVar]?.trim();
	if (!email || !password) return null;
	return { email, password };
}

test.describe("login redirect by role", () => {
	test("applicant lands on /apply after sign-in", async ({ page }) => {
		const c = creds("E2E_APPLICANT_EMAIL", "E2E_APPLICANT_PASSWORD");
		if (!c) {
			test.skip(true, "Set E2E_APPLICANT_EMAIL and E2E_APPLICANT_PASSWORD");
			return;
		}
		await signInWithPassword(page, c.email, c.password);
		await expect(page).toHaveURL(/\/apply(\/|$)/, { timeout: 30_000 });
	});

	test("reviewer lands on /review after sign-in", async ({ page }) => {
		const c = creds("E2E_REVIEWER_EMAIL", "E2E_REVIEWER_PASSWORD");
		if (!c) {
			test.skip(true, "Set E2E_REVIEWER_EMAIL and E2E_REVIEWER_PASSWORD");
			return;
		}
		await signInWithPassword(page, c.email, c.password);
		await expect(page).toHaveURL(/\/review(\/|$)/, { timeout: 30_000 });
	});

	test("alumni lands on /network after sign-in", async ({ page }) => {
		const c = creds("E2E_ALUMNI_EMAIL", "E2E_ALUMNI_PASSWORD");
		if (!c) {
			test.skip(true, "Set E2E_ALUMNI_EMAIL and E2E_ALUMNI_PASSWORD");
			return;
		}
		await signInWithPassword(page, c.email, c.password);
		await expect(page).toHaveURL(/\/network(\/|$)/, { timeout: 30_000 });
	});

	test("admin lands on /admin after sign-in", async ({ page }) => {
		const c = creds("E2E_ADMIN_EMAIL", "E2E_ADMIN_PASSWORD");
		if (!c) {
			test.skip(true, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD");
			return;
		}
		await signInWithPassword(page, c.email, c.password);
		await expect(page).toHaveURL(/\/admin(\/|$)/, { timeout: 30_000 });
	});

	test("reviewer returns to protected path from login state", async ({
		page,
	}) => {
		const c = creds("E2E_REVIEWER_EMAIL", "E2E_REVIEWER_PASSWORD");
		if (!c) {
			test.skip(true, "Set E2E_REVIEWER_EMAIL and E2E_REVIEWER_PASSWORD");
			return;
		}
		await page.goto("/review");
		await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
		await signInWithPassword(page, c.email, c.password);
		await expect(page).toHaveURL(/\/review(\/|$)/, { timeout: 30_000 });
	});
});

test.describe("review verdict", () => {
	test("reviewer can tap Pass when the deck has a current card", async ({
		page,
	}) => {
		const c = creds("E2E_REVIEWER_EMAIL", "E2E_REVIEWER_PASSWORD");
		if (!c) {
			test.skip(true, "Set E2E_REVIEWER_EMAIL and E2E_REVIEWER_PASSWORD");
			return;
		}
		await signInWithPassword(page, c.email, c.password);
		await expect(page).toHaveURL(/\/review/, { timeout: 30_000 });
		await expect(
			page.getByRole("heading", { name: /review queue/i }),
		).toBeVisible();
		const passBtn = page.getByRole("button", { name: /^Pass$/ });
		await passBtn.waitFor({ state: "visible", timeout: 20_000 });
		if (await passBtn.isDisabled()) {
			test.skip(
				true,
				"No current application in reviewer queue — seed submitted apps or relax filters.",
			);
		}
		await passBtn.click();
		await expect(
			page.getByText(/Something went wrong talking to the database/i),
		).not.toBeVisible({ timeout: 10_000 });
	});
});

test.describe("apply submit", () => {
	test("applicant can submit a complete draft", async ({ page }) => {
		const c = creds("E2E_APPLICANT_EMAIL", "E2E_APPLICANT_PASSWORD");
		if (!c) {
			test.skip(true, "Set E2E_APPLICANT_EMAIL and E2E_APPLICANT_PASSWORD");
			return;
		}
		await signInWithPassword(page, c.email, c.password);
		await expect(page).toHaveURL(/\/apply/, { timeout: 30_000 });
		if (
			await page
				.getByRole("heading", { name: /what you submitted/i })
				.isVisible()
				.catch(() => false)
		) {
			test.skip(
				true,
				"Applicant already submitted — use a draft test account.",
			);
		}
		await page.getByLabel(/full name/i).fill("E2E Test Applicant");
		await page
			.locator('input[type="file"][accept*="image"]')
			.setInputFiles("tests/fixtures/headshot.jpg");
		await expect(page.getByAltText(/headshot preview/i)).toBeVisible({
			timeout: 30_000,
		});
		await page.getByLabel(/major/i).fill("Economics");
		await page.getByLabel(/academic year/i).fill("Sophomore");
		await page.getByRole("button", { name: /2\.\s*Essay/i }).click();
		await page
			.getByLabel(/why mecg/i)
			.fill("E2E automated submission — testing the apply flow.");
		await page.getByRole("button", { name: /3\.\s*Links/i }).click();
		await page.getByRole("button", { name: /submit application/i }).click();
		await page.getByRole("button", { name: /submit now/i }).click();
		await expect(page.getByText(/application submitted/i)).toBeVisible({
			timeout: 45_000,
		});
	});
});
