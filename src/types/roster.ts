/** One person on the W26 membership roster (landing / Firm section). */
export type RosterMember = {
	displayName: string;
	role: string;
	/** Tab in FirmSection: Exec Board | Analysts (PMs kept on roster data for imports, not shown as a tab). */
	category: RosterCategory;
	/** Public URL under /headshots/ */
	imageSrc: string;
};

export type RosterCategory = "Exec Board" | "PMs" | "Analysts";

export const ROSTER_TAB_ORDER: RosterCategory[] = ["Exec Board", "Analysts"];
