import { Helmet } from "react-helmet-async";

import { absoluteUrl, getSiteOrigin } from "@/src/lib/site-url.ts";

export type SeoProps = {
	title: string;
	description: string;
	/** Path only, e.g. `/login` — builds canonical + og:url */
	pathname: string;
	noindex?: boolean;
	/** Path under public/, default `/og.png` */
	ogImagePath?: string;
};

/**
 * Per-route head tags. Use on marketing/auth pages; portal shells use `noindex` via
 * `PortalSeo` in `AppShell`.
 */
export function Seo({
	title,
	description,
	pathname,
	noindex = false,
	ogImagePath = "/og.png",
}: SeoProps) {
	const origin = getSiteOrigin();
	const canonical = `${origin}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
	const ogImage = absoluteUrl(ogImagePath);

	return (
		<Helmet>
			<title>{title}</title>
			<meta name="description" content={description} />
			<link rel="canonical" href={canonical} />
			{noindex ? (
				<meta name="robots" content="noindex, nofollow" />
			) : (
				<meta name="robots" content="index, follow" />
			)}

			<meta property="og:type" content="website" />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:url" content={canonical} />
			<meta property="og:image" content={ogImage} />
			<meta property="og:image:width" content="1200" />
			<meta property="og:image:height" content="630" />
			<meta property="og:locale" content="en_US" />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={title} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={ogImage} />
		</Helmet>
	);
}
