/** Matches public.user_roles.role check constraint */
export type AppRole = "applicant" | "alumni" | "reviewer" | "admin";

/** Matches public.applications.status */
export type ApplicationStatus =
	| "draft"
	| "submitted"
	| "under_review"
	| "accepted"
	| "rejected";

/** Matches public.application_reviews.verdict */
export type ReviewVerdict = "pass" | "maybe" | "yes" | "shortlist";

/** Matches public.application_reviews.review_phase */
export type ReviewPhase = "screening" | "final";

/** Optional rubric dimensions stored in application_reviews.scores */
export type ReviewRubricScores = {
	fit?: number;
	communication?: number;
};

/** Stored in applications.answers (jsonb) */
export interface ApplicationAnswers {
	fullName: string;
	/** Supabase Storage path within `application-headshots` bucket (e.g. `{user_id}/headshot.jpg`). */
	headshotPath?: string;
	major: string;
	academicYear: string;
	whyMecg: string;
	resumeUrl?: string;
}

export interface ProfileRow {
	id: string;
	display_name: string | null;
	cohort: string | null;
	industry: string | null;
	interests: string[];
	graduation_year: number | null;
	open_to_mentoring: boolean;
	open_to_coffee_chats: boolean;
	linkedin_url: string | null;
	directory_visible: boolean;
	show_linkedin: boolean;
	show_interests: boolean;
	show_cohort: boolean;
	show_industry: boolean;
	created_at: string;
	updated_at: string;
}

/** Masked peer rows from `list_directory_profiles` RPC (not raw `profiles` SELECT). */
export type DirectoryProfileRow = {
	id: string;
	display_name: string | null;
	cohort: string | null;
	industry: string | null;
	interests: string[] | null;
	graduation_year: number | null;
	linkedin_url: string | null;
	open_to_mentoring: boolean;
	open_to_coffee_chats: boolean;
	directory_visible: boolean;
};

/** Subset for form state / own profile fetch — omits timestamps. */
export type ProfileEditableRow = Pick<
	ProfileRow,
	| "id"
	| "display_name"
	| "cohort"
	| "industry"
	| "interests"
	| "graduation_year"
	| "open_to_mentoring"
	| "open_to_coffee_chats"
	| "linkedin_url"
	| "directory_visible"
	| "show_linkedin"
	| "show_interests"
	| "show_cohort"
	| "show_industry"
>;

export type NetworkEventKind = "event" | "office_hours";

export type NetworkEventRsvpStatus = "going" | "waitlist" | "cancelled";

export interface NetworkEventRow {
	id: string;
	title: string;
	body: string | null;
	kind: NetworkEventKind;
	starts_at: string;
	ends_at: string;
	location: string | null;
	meet_link: string | null;
	capacity: number | null;
	created_at: string;
	created_by: string | null;
}

export interface NetworkEventRsvpRow {
	event_id: string;
	user_id: string;
	status: NetworkEventRsvpStatus;
	created_at: string;
	updated_at: string;
}

export interface UserRoleRow {
	user_id: string;
	role: AppRole;
}

export interface ApplicationRow {
	id: string;
	user_id: string;
	status: ApplicationStatus;
	batch_id: string;
	answers: ApplicationAnswers;
	/** Denormalized from profile at submit for reviewer filters. */
	cohort: string | null;
	tags: string[];
	assigned_reviewer_id: string | null;
	submitted_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface ApplicationReviewRow {
	id: string;
	application_id: string;
	reviewer_id: string;
	review_phase: ReviewPhase;
	verdict: ReviewVerdict;
	score: number | null;
	/** Structured rubric; kept alongside legacy scalar score. */
	scores: ReviewRubricScores | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
}

/** public.review_blind_pass */
export interface ReviewBlindPassRow {
	application_id: string;
	reviewer_id: string;
	completed_at: string;
}

/** Supabase generated shape (minimal) for createClient generic */
export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: ProfileRow;
				Insert: Partial<ProfileRow> & { id: string };
				Update: Partial<ProfileRow>;
			};
			user_roles: {
				Row: UserRoleRow;
				Insert: UserRoleRow;
				Update: Partial<UserRoleRow>;
			};
			applications: {
				Row: ApplicationRow;
				Insert: Omit<ApplicationRow, "id" | "created_at" | "updated_at"> & {
					id?: string;
				};
				Update: Partial<ApplicationRow>;
			};
			application_reviews: {
				Row: ApplicationReviewRow;
				Insert: Omit<
					ApplicationReviewRow,
					"id" | "created_at" | "updated_at"
				> & {
					id?: string;
				};
				Update: Partial<ApplicationReviewRow>;
			};
			review_blind_pass: {
				Row: ReviewBlindPassRow;
				Insert: Omit<ReviewBlindPassRow, "completed_at"> & {
					completed_at?: string;
				};
				Update: Partial<ReviewBlindPassRow>;
			};
			network_events: {
				Row: NetworkEventRow;
				Insert: Omit<NetworkEventRow, "id" | "created_at"> & { id?: string };
				Update: Partial<NetworkEventRow>;
			};
			network_event_rsvps: {
				Row: NetworkEventRsvpRow;
				Insert: Omit<NetworkEventRsvpRow, "created_at" | "updated_at">;
				Update: Partial<NetworkEventRsvpRow>;
			};
		};
	};
}
