import { expect, test } from "@playwright/test";

test.describe("public marketing shell", () => {
	test("home page has MECG title and main landmark", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveTitle(/MECG/i);
		await expect(page.getByRole("main")).toBeVisible();
	});

	test("login page shows sign-in heading", async ({ page }) => {
		await page.goto("/login");
		await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
	});
});
