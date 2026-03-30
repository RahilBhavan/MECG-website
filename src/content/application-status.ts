import type { ApplicationStatus } from "@/src/types/database";

export type StatusHubContent = {
	title: string;
	body: string;
	nextSteps: string[];
};

/** Applicant-facing status hub copy (edit here, not scattered in JSX). */
export const APPLICATION_STATUS_HUB: Record<
	Exclude<ApplicationStatus, "draft">,
	StatusHubContent
> = {
	submitted: {
		title: "Application received",
		body: "We have your submission. The recruitment team will review it in the order received for your cohort.",
		nextSteps: [
			"You’ll get email updates if we need anything else or when there’s a decision.",
			"Check spam or promotions folders if you don’t see messages within a few days of deadlines.",
			"You can review what you submitted below; answers can’t be edited after submit.",
		],
	},
	under_review: {
		title: "Under review",
		body: "Your application is being evaluated. No action is needed from you right now.",
		nextSteps: [
			"Watch your inbox for interview or follow-up requests.",
			"If something material changes (e.g. availability), reach out using the contact below.",
		],
	},
	accepted: {
		title: "Accepted",
		body: "Congratulations — we’re excited to have you move forward. Follow the onboarding checklist for concrete next steps.",
		nextSteps: [
			"Complete the items in the checklist on this page.",
			"When alumni access is enabled, you can use Network from the portal header.",
		],
	},
	rejected: {
		title: "Decision released",
		body: "Thank you for applying and for the time you invested. This cycle’s decision is not to move forward.",
		nextSteps: [
			"You can read more below. We’re not able to provide individual feedback on every application.",
			"If something looks incorrect (wrong name, duplicate account), contact us using the link below.",
		],
	},
};
