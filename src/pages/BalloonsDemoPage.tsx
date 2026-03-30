import { Link } from "react-router-dom";

import { DefaultBalloonsDemo } from "@/components/ui/default-balloons-demo";

/** Dev/marketing demo for balloons-js + shadcn-style Button (not part of portal shell). */
export default function BalloonsDemoPage() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="border-b border-border px-4 py-3">
				<Link
					to="/"
					className="text-technical text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded px-1"
				>
					← Back to site
				</Link>
			</div>
			<DefaultBalloonsDemo />
		</div>
	);
}
