import { describe, expect, it } from "vitest";

import { getPostLoginPath, hasRole } from "@/src/auth/AuthProvider";
import type { AppRole } from "@/src/types/database";

describe("getPostLoginPath", () => {
	it("prioritizes admin over other roles", () => {
		expect(getPostLoginPath(["applicant", "reviewer", "admin"])).toBe("/admin");
	});

	it("sends reviewers to /review when not admin", () => {
		expect(getPostLoginPath(["applicant", "reviewer"])).toBe("/review");
	});

	it("sends alumni to /network when not admin or reviewer", () => {
		expect(getPostLoginPath(["applicant", "alumni"])).toBe("/network");
	});

	it("defaults applicants to /apply", () => {
		expect(getPostLoginPath(["applicant"])).toBe("/apply");
	});

	it("handles empty roles", () => {
		expect(getPostLoginPath([])).toBe("/apply");
	});
});

describe("hasRole", () => {
	const roles: AppRole[] = ["applicant", "reviewer"];

	it("returns true when role is present", () => {
		expect(hasRole(roles, "reviewer")).toBe(true);
	});

	it("returns false when role is absent", () => {
		expect(hasRole(roles, "admin")).toBe(false);
	});
});
