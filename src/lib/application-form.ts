import { z } from "zod";

import type { ApplicationAnswers } from "@/src/types/database";

export function emptyAnswers(): ApplicationAnswers {
	return {
		fullName: "",
		headshotPath: "",
		major: "",
		academicYear: "",
		whyMecg: "",
		resumeUrl: "",
	};
}

export function normalizeAnswers(raw: unknown): ApplicationAnswers {
	if (!raw || typeof raw !== "object") return emptyAnswers();
	const o = raw as Record<string, unknown>;
	return {
		fullName: String(o.fullName ?? ""),
		headshotPath: o.headshotPath != null ? String(o.headshotPath) : "",
		major: String(o.major ?? ""),
		academicYear: String(o.academicYear ?? ""),
		whyMecg: String(o.whyMecg ?? ""),
		resumeUrl: o.resumeUrl != null ? String(o.resumeUrl) : "",
	};
}

/** Payload stored in `applications.answers` (trimmed optional fields). */
export function buildAnswersPayload(
	answers: ApplicationAnswers,
): Record<string, unknown> {
	const resumeUrl = answers.resumeUrl?.trim() || undefined;
	const headshotPath = answers.headshotPath?.trim() || undefined;
	return {
		...answers,
		resumeUrl,
		headshotPath,
	};
}

export function serializeDraftSnapshot(
	answers: ApplicationAnswers,
	batchId: string,
): string {
	return JSON.stringify({
		batchId,
		answers: buildAnswersPayload(answers),
	});
}

const applicationSubmitSchema = z
	.object({
		fullName: z.string().transform((s) => s.trim()),
		headshotPath: z
			.string()
			.optional()
			.transform((s) => s?.trim() ?? ""),
		major: z.string().transform((s) => s.trim()),
		academicYear: z.string().transform((s) => s.trim()),
		whyMecg: z.string().transform((s) => s.trim()),
		resumeUrl: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (!data.fullName) {
			ctx.addIssue({
				code: "custom",
				message: "Enter your full name.",
				path: ["fullName"],
			});
		}
		if (!data.headshotPath) {
			ctx.addIssue({
				code: "custom",
				message: "Upload a headshot — reviewers need a clear photo.",
				path: ["headshotPath"],
			});
		}
		if (!data.major) {
			ctx.addIssue({
				code: "custom",
				message: "Enter your major or field of study.",
				path: ["major"],
			});
		}
		if (!data.academicYear) {
			ctx.addIssue({
				code: "custom",
				message: "Enter your academic year (e.g. Sophomore).",
				path: ["academicYear"],
			});
		}
		if (!data.whyMecg) {
			ctx.addIssue({
				code: "custom",
				message: "Tell us why you’re interested in MECG.",
				path: ["whyMecg"],
			});
		}
		const resume = data.resumeUrl?.trim() ?? "";
		if (resume && !z.string().url().safeParse(resume).success) {
			ctx.addIssue({
				code: "custom",
				message: "Enter a valid URL, or leave this blank.",
				path: ["resumeUrl"],
			});
		}
	});

/** Field-level errors for submit / open dialog (keys match form + resumeUrl). */
export function getApplicationSubmitFieldErrors(
	answers: ApplicationAnswers,
): Record<string, string> {
	const parsed = applicationSubmitSchema.safeParse(answers);
	if (parsed.success) return {};
	const out: Record<string, string> = {};
	for (const issue of parsed.error.issues) {
		const key = issue.path[0];
		if (typeof key === "string" && !out[key]) out[key] = issue.message;
	}
	return out;
}

const BLUR_MESSAGES: Record<
	"fullName" | "major" | "academicYear" | "whyMecg",
	string
> = {
	fullName: "Enter your full name.",
	major: "Enter your major or field of study.",
	academicYear: "Enter your academic year.",
	whyMecg: "This answer is required.",
};

export function blurFieldMessage(
	field: keyof typeof BLUR_MESSAGES,
	value: string,
): string {
	if (!value.trim()) return BLUR_MESSAGES[field];
	return "";
}

export function resumeUrlFieldError(resumeUrl: string | undefined): string {
	const r = resumeUrl?.trim() ?? "";
	if (!r) return "";
	return z.string().url().safeParse(r).success
		? ""
		: "Enter a valid URL, or leave this blank.";
}
