import type { Page } from "@playwright/test";

export async function signInWithPassword(
	page: Page,
	email: string,
	password: string,
): Promise<void> {
	await page.goto("/login");
	await page.getByLabel("Email", { exact: true }).fill(email);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: /sign in/i }).click();
}
