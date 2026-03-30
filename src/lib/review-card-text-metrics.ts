import { layout, prepare } from "@chenglou/pretext";
import {
	REVIEW_CARD_BODY_FONT,
	REVIEW_CARD_BODY_LINE_HEIGHT_PX,
	REVIEW_CARD_HEADSHOT_PX,
	REVIEW_CARD_LINK_FONT,
	REVIEW_CARD_LINK_LINE_HEIGHT_PX,
	REVIEW_CARD_META_FONT,
	REVIEW_CARD_META_LINE_HEIGHT_PX,
	REVIEW_CARD_NAME_FONT,
	REVIEW_CARD_NAME_LINE_HEIGHT_PX,
	REVIEW_CARD_PADDING_Y_PX,
	REVIEW_CARD_STACK_GAP_PX,
} from "@/src/lib/pretext-review-card-fonts";
import type { ApplicationAnswers } from "@/src/types/database";

const FALLBACK_MIN_STACK_PX = 380;

function layoutHeight(
	prepared: ReturnType<typeof prepare>,
	maxWidthPx: number,
	lineHeightPx: number,
): number {
	if (maxWidthPx <= 0) return 0;
	return layout(prepared, maxWidthPx, lineHeightPx).height;
}

/**
 * Horizontal space available for text inside a padded card root (e.g. `p-6`).
 */
export function textMaxWidthFromCardRoot(el: HTMLElement): number {
	const style = getComputedStyle(el);
	const pl = Number.parseFloat(style.paddingLeft) || 0;
	const pr = Number.parseFloat(style.paddingRight) || 0;
	return Math.max(0, Math.floor(el.clientWidth - pl - pr));
}

/**
 * Off-DOM stack height for `CardContent` (padding + headshot + gaps + text blocks).
 * Returns a conservative minimum for layout stability when width is known.
 */
export function measureReviewCardContentMinHeightPx(
	answers: ApplicationAnswers,
	textMaxWidthPx: number,
): number {
	if (typeof document === "undefined") return FALLBACK_MIN_STACK_PX;
	if (textMaxWidthPx <= 0) return FALLBACK_MIN_STACK_PX;

	const w = textMaxWidthPx;
	const hasHeadshot = Boolean(answers.headshotPath?.trim());
	const hasResume = Boolean(answers.resumeUrl?.trim());

	const nameText = answers.fullName?.trim() || "Applicant";
	const metaText =
		`${answers.major ?? ""} · ${answers.academicYear ?? ""}`.toUpperCase();
	const whyText = answers.whyMecg ?? "";

	const nChildren = (hasHeadshot ? 1 : 0) + 1 + 1 + 1 + (hasResume ? 1 : 0);
	const gapTotal = Math.max(0, nChildren - 1) * REVIEW_CARD_STACK_GAP_PX;

	let body = REVIEW_CARD_PADDING_Y_PX + gapTotal;
	if (hasHeadshot) body += REVIEW_CARD_HEADSHOT_PX;

	const prepName = prepare(nameText, REVIEW_CARD_NAME_FONT);
	body += layoutHeight(prepName, w, REVIEW_CARD_NAME_LINE_HEIGHT_PX);

	const prepMeta = prepare(metaText, REVIEW_CARD_META_FONT);
	body += layoutHeight(prepMeta, w, REVIEW_CARD_META_LINE_HEIGHT_PX);

	const prepWhy = prepare(whyText, REVIEW_CARD_BODY_FONT, {
		whiteSpace: "pre-wrap",
	});
	body += layoutHeight(prepWhy, w, REVIEW_CARD_BODY_LINE_HEIGHT_PX);

	if (hasResume) {
		const prepLink = prepare("OPEN RESUME LINK", REVIEW_CARD_LINK_FONT);
		body += layoutHeight(prepLink, w, REVIEW_CARD_LINK_LINE_HEIGHT_PX);
	}

	return body;
}
