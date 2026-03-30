import { layout, prepare } from "@chenglou/pretext";

import type { RosterMember } from "@/src/types/roster";

/** Firm row `h4` — `text-2xl font-display` */
const NAME_FONT_MOBILE = '400 24px "Playfair Display"';
const NAME_LINE_HEIGHT_MOBILE_PX = 32;

/** `md:text-3xl` */
const NAME_FONT_LG = '400 30px "Playfair Display"';
const NAME_LINE_HEIGHT_LG_PX = 36;

/** Role column — `.text-technical` + inherited body leading */
const ROLE_FONT = '500 11px "Inter"';
const ROLE_LINE_HEIGHT_PX = Math.round(11 * 1.68);

const ROW_PADDING_Y_PX = 48;
const GAP_STACK_PX = 16;
const AVATAR_PX = 64;
const GAP_AVATAR_NAME_SM_PX = 24;
const GAP_AVATAR_NAME_LG_PX = 32;
const HORIZONTAL_INSET_PX = 32;

const FALLBACK_ROW_PX = 140;

function layoutBlock(
	prepared: ReturnType<typeof prepare>,
	maxWidthPx: number,
	lineHeightPx: number,
): number {
	if (maxWidthPx <= 0) return 0;
	return layout(prepared, maxWidthPx, lineHeightPx).height;
}

/**
 * Off-DOM height estimate for one Firm roster row (`FirmSection` list item).
 * Matches mobile stack vs `lg:flex-row` roughly; TanStack `measureElement` refines.
 */
export function estimateFirmRosterRowHeightPx(
	member: RosterMember,
	listInnerWidthPx: number,
	isLg: boolean,
): number {
	if (typeof document === "undefined") return FALLBACK_ROW_PX;
	if (listInnerWidthPx <= 0) return FALLBACK_ROW_PX;

	const inner = Math.max(0, Math.floor(listInnerWidthPx - HORIZONTAL_INSET_PX));
	const nameMobile = prepare(member.displayName, NAME_FONT_MOBILE);
	const nameLg = prepare(member.displayName, NAME_FONT_LG);
	const rolePrep = prepare(member.role, ROLE_FONT);

	if (isLg) {
		const roleCol = Math.min(280, Math.max(120, Math.floor(inner * 0.38)));
		const nameAvail = Math.max(
			80,
			inner - AVATAR_PX - GAP_AVATAR_NAME_LG_PX - roleCol,
		);
		const nameH = layoutBlock(nameLg, nameAvail, NAME_LINE_HEIGHT_LG_PX);
		const roleH = layoutBlock(rolePrep, roleCol, ROLE_LINE_HEIGHT_PX);
		const rowCore = Math.max(Math.max(AVATAR_PX, nameH), roleH);
		return ROW_PADDING_Y_PX + rowCore;
	}

	const nameW = Math.max(0, inner - AVATAR_PX - GAP_AVATAR_NAME_SM_PX);
	const nameH = layoutBlock(nameMobile, nameW, NAME_LINE_HEIGHT_MOBILE_PX);
	const topBlock = Math.max(AVATAR_PX, nameH);
	const roleH = layoutBlock(rolePrep, inner, ROLE_LINE_HEIGHT_PX);
	return ROW_PADDING_Y_PX + topBlock + GAP_STACK_PX + roleH;
}
