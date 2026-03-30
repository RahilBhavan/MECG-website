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
export type ReviewVerdict = "pass" | "maybe" | "yes";

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
	open_to_mentoring: boolean;
	linkedin_url: string | null;
	directory_visible: boolean;
	created_at: string;
	updated_at: string;
}

/** Subset returned by directory/list `select(...)` — omits timestamps. */
export type ProfileDirectoryRow = Pick<
	ProfileRow,
	| "id"
	| "display_name"
	| "cohort"
	| "industry"
	| "open_to_mentoring"
	| "linkedin_url"
	| "directory_visible"
>;

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
	submitted_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface ApplicationReviewRow {
	id: string;
	application_id: string;
	reviewer_id: string;
	verdict: ReviewVerdict;
	score: number | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
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
		};
	};
}
