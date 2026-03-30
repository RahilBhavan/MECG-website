import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { Seo } from "@/src/components/seo.tsx";

function portalMeta(pathname: string): { title: string; description: string } {
	if (pathname.startsWith("/apply"))
		return {
			title: "Apply — MECG",
			description:
				"Submit or update your Michigan Engineering Consulting Group application.",
		};
	if (pathname.startsWith("/review"))
		return {
			title: "Review — MECG",
			description: "Reviewer tools for MECG applications.",
		};
	if (pathname.startsWith("/network"))
		return {
			title: "Network — MECG",
			description: "Alumni directory and network for MECG members.",
		};
	if (pathname.startsWith("/admin/applications"))
		return {
			title: "Applications — MECG Admin",
			description: "Manage application statuses for MECG.",
		};
	if (pathname.startsWith("/admin"))
		return {
			title: "Admin — MECG",
			description: "MECG administration.",
		};
	return {
		title: "Portal — MECG",
		description: "MECG member portal.",
	};
}

/** `noindex` + route-specific titles for authenticated portal routes. */
export function PortalSeo() {
	const { pathname } = useLocation();
	const { title, description } = useMemo(
		() => portalMeta(pathname),
		[pathname],
	);

	return (
		<Seo title={title} description={description} pathname={pathname} noindex />
	);
}
