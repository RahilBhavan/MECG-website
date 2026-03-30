import { useRef } from "react";

import { Balloons, type BalloonsHandle } from "@/components/ui/balloons";
import { Button } from "@/components/ui/button";

export function DefaultBalloonsDemo() {
	const balloonsRef = useRef<BalloonsHandle | null>(null);

	const handleLaunch = () => {
		balloonsRef.current?.launchAnimation();
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
			<Button type="button" onClick={handleLaunch} variant="default">
				Launch balloons
			</Button>

			<Balloons ref={balloonsRef} type="default" />
		</div>
	);
}
