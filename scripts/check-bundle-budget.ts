/**
 * Guardrail: fail if any single JS chunk grows past an expected ceiling (post-`bun run build`).
 * Tuned for this app’s split: `vendor-three` (Three.js) is typically the largest file.
 */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST_ASSETS = join(process.cwd(), "dist", "assets");
const MAX_LARGEST_JS_BYTES = 1_300_000;

function main(): void {
	let max = 0;
	let maxFile = "";
	for (const name of readdirSync(DIST_ASSETS)) {
		if (!name.endsWith(".js")) continue;
		const size = statSync(join(DIST_ASSETS, name)).size;
		if (size > max) {
			max = size;
			maxFile = name;
		}
	}
	if (max === 0) {
		console.error("check-bundle-budget: no JS files in dist/assets");
		process.exit(1);
	}
	const maxMiB = (max / 1024 / 1024).toFixed(2);
	const limitMiB = (MAX_LARGEST_JS_BYTES / 1024 / 1024).toFixed(2);
	if (max > MAX_LARGEST_JS_BYTES) {
		console.error(
			`Bundle budget exceeded: ${maxFile} is ${maxMiB} MiB (limit ${limitMiB} MiB)`,
		);
		process.exit(1);
	}
	console.log(
		`Bundle budget OK: largest JS ${maxFile} ${(max / 1024).toFixed(1)} KiB`,
	);
}

main();
