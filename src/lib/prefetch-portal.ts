/** Warm the lazy chunk for the user’s first portal destination after login. */
export function prefetchPortalRoute(path: string): void {
	const run = () => {
		if (path.startsWith("/admin")) void import("@/src/pages/AdminRolesPage");
		else if (path.startsWith("/review")) void import("@/src/pages/ReviewPage");
		else if (path.startsWith("/network"))
			void import("@/src/pages/NetworkPage");
		else if (path.startsWith("/apply")) void import("@/src/pages/ApplyPage");
		else if (path.startsWith("/pending"))
			void import("@/src/pages/PendingPage");
	};
	if (typeof window !== "undefined" && "requestIdleCallback" in window) {
		window.requestIdleCallback(run);
	} else {
		setTimeout(run, 0);
	}
}
