import type { Session, User } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

import { isSupabaseConfigured, supabase } from "@/src/lib/supabase";
import type { AppRole } from "@/src/types/database";

interface AuthContextValue {
	user: User | null;
	session: Session | null;
	roles: AppRole[];
	loading: boolean;
	configured: boolean;
	refreshRoles: () => Promise<void>;
	signInWithPassword: (
		email: string,
		password: string,
	) => Promise<{ error: Error | null; roles: AppRole[] }>;
	signUpWithPassword: (
		email: string,
		password: string,
		displayName: string,
	) => Promise<{ error: Error | null; session: Session | null }>;
	resetPasswordForEmail: (
		email: string,
		redirectTo: string,
	) => Promise<{ error: Error | null }>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchRolesForUser(userId: string): Promise<AppRole[]> {
	const { data, error } = await supabase
		.from("user_roles")
		.select("role")
		.eq("user_id", userId);

	if (error || !data) return [];
	return (data as { role: string }[]).map((row) => row.role as AppRole);
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [roles, setRoles] = useState<AppRole[]>([]);
	const [loading, setLoading] = useState(true);
	const configured = isSupabaseConfigured();

	const refreshRoles = useCallback(async () => {
		const uid = session?.user?.id;
		if (!uid) {
			setRoles([]);
			return;
		}
		setRoles(await fetchRolesForUser(uid));
	}, [session?.user?.id]);

	useEffect(() => {
		if (!configured) {
			setLoading(false);
			return;
		}

		let cancelled = false;

		void supabase.auth.getSession().then(({ data: { session: s } }) => {
			if (cancelled) return;
			setSession(s);
			setLoading(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, newSession) => {
			setSession(newSession);
			setLoading(false);
		});

		return () => {
			cancelled = true;
			subscription.unsubscribe();
		};
	}, [configured]);

	useEffect(() => {
		if (!session?.user?.id) {
			setRoles([]);
			return;
		}
		void (async () => {
			setRoles(await fetchRolesForUser(session.user.id));
		})();
	}, [session?.user?.id]);

	const signInWithPassword = useCallback(
		async (email: string, password: string) => {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error)
				return { error: new Error(error.message), roles: [] as AppRole[] };
			const uid = data.user?.id ?? data.session?.user?.id;
			if (!uid) return { error: null, roles: [] as AppRole[] };
			const nextRoles = await fetchRolesForUser(uid);
			setRoles(nextRoles);
			return { error: null, roles: nextRoles };
		},
		[],
	);

	const signUpWithPassword = useCallback(
		async (email: string, password: string, displayName: string) => {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: { data: { display_name: displayName } },
			});
			return {
				error: error ? new Error(error.message) : null,
				session: data.session ?? null,
			};
		},
		[],
	);

	const resetPasswordForEmail = useCallback(
		async (email: string, redirectTo: string) => {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo,
			});
			return { error: error ? new Error(error.message) : null };
		},
		[],
	);

	const signOut = useCallback(async () => {
		await supabase.auth.signOut();
		setRoles([]);
	}, []);

	const value = useMemo<AuthContextValue>(
		() => ({
			user: session?.user ?? null,
			session,
			roles,
			loading,
			configured,
			refreshRoles,
			signInWithPassword,
			signUpWithPassword,
			resetPasswordForEmail,
			signOut,
		}),
		[
			session,
			roles,
			loading,
			configured,
			refreshRoles,
			signInWithPassword,
			signUpWithPassword,
			resetPasswordForEmail,
			signOut,
		],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}

/** First matching destination after login (reviewers prioritized). */
export function getPostLoginPath(roleList: AppRole[]): string {
	if (roleList.includes("admin")) return "/admin";
	if (roleList.includes("reviewer")) return "/review";
	if (roleList.includes("alumni")) return "/network";
	return "/apply";
}

export function hasRole(roles: AppRole[], role: AppRole): boolean {
	return roles.includes(role);
}
