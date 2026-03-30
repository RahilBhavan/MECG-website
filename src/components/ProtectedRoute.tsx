import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { hasRole, useAuth } from "@/src/auth/AuthProvider";
import type { AppRole } from "@/src/types/database";

interface ProtectedRouteProps {
	children: ReactNode;
	/** If set, user must have at least one of these roles */
	roles?: AppRole[];
}

export function ProtectedRoute({
	children,
	roles: requiredRoles,
}: ProtectedRouteProps) {
	const { user, roles, loading, configured } = useAuth();
	const location = useLocation();

	if (!configured) {
		return (
			<div className="min-h-screen bg-bg text-ink flex items-center justify-center px-6">
				<p className="text-technical text-muted max-w-md text-center">
					Supabase is not configured. Set VITE_SUPABASE_URL and
					VITE_SUPABASE_ANON_KEY in .env.local.
				</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-bg text-ink flex items-center justify-center">
				<p className="text-technical text-muted">Loading session…</p>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}

	if (requiredRoles?.length) {
		const allowed = requiredRoles.some((r) => hasRole(roles, r));
		if (!allowed) {
			return <Navigate to="/" replace />;
		}
	}

	return <>{children}</>;
}
