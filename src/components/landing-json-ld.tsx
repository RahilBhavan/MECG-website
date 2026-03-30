import { Helmet } from "react-helmet-async";

import { getSiteOrigin } from "@/src/lib/site-url.ts";

/** Organization + WebSite JSON-LD on the marketing home page only. */
export function LandingJsonLd() {
	const origin = getSiteOrigin();
	const payload = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				"@id": `${origin}/#organization`,
				name: "Michigan Engineering Consulting Group",
				alternateName: "MECG",
				url: origin,
				description:
					"Pro-bono consulting group open to all majors at the University of Michigan.",
			},
			{
				"@type": "WebSite",
				"@id": `${origin}/#website`,
				url: origin,
				name: "MECG",
				publisher: { "@id": `${origin}/#organization` },
			},
		],
	};

	return (
		<Helmet>
			<script type="application/ld+json">{JSON.stringify(payload)}</script>
		</Helmet>
	);
}
