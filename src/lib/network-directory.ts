import { supabase } from "@/src/lib/supabase";
import type { DirectoryProfileRow } from "@/src/types/database";

export async function listDirectoryProfiles(params: {
	p_q?: string | null;
	p_cohort_substr?: string | null;
	p_interest?: string | null;
	p_graduation_year?: number | null;
	p_limit?: number;
	p_offset?: number;
}): Promise<{ data: DirectoryProfileRow[]; error: Error | null }> {
	const { data, error } = await supabase.rpc("list_directory_profiles", {
		p_q: params.p_q ?? null,
		p_cohort_substr: params.p_cohort_substr ?? null,
		p_interest: params.p_interest ?? null,
		p_graduation_year: params.p_graduation_year ?? null,
		p_limit: params.p_limit ?? 50,
		p_offset: params.p_offset ?? 0,
	});
	if (error) return { data: [], error: new Error(error.message) };
	return { data: (data ?? []) as DirectoryProfileRow[], error: null };
}
