import * as THREE from "three";

/** Deterministic PRNG for stable graph layout across reloads (Mulberry32). */
export function createSeededRandom(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a += 0x6d2b79f5;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export type HeroGraphData = {
	positions: THREE.Vector3[];
	lineGeometry: THREE.BufferGeometry;
};

const DEFAULT_NODE_COUNT = 60;
const LINK_DISTANCE = 1.6;

/**
 * Spherical shell node positions + line segment geometry for the hero data network.
 */
export function buildHeroGraph(
	nodeCount: number = DEFAULT_NODE_COUNT,
	seed = 0x4d454367,
): HeroGraphData {
	const rand = createSeededRandom(seed);
	const positions: THREE.Vector3[] = [];

	for (let i = 0; i < nodeCount; i++) {
		const r = 1.2 + rand() * 1.5;
		const theta = rand() * 2 * Math.PI;
		const phi = Math.acos(2 * rand() - 1);
		const x = r * Math.sin(phi) * Math.cos(theta);
		const y = r * Math.sin(phi) * Math.sin(theta);
		const z = r * Math.cos(phi);
		positions.push(new THREE.Vector3(x, y, z));
	}

	const linePts: THREE.Vector3[] = [];
	for (let i = 0; i < nodeCount; i++) {
		for (let j = i + 1; j < nodeCount; j++) {
			if (positions[i].distanceTo(positions[j]) < LINK_DISTANCE) {
				linePts.push(positions[i], positions[j]);
			}
		}
	}

	const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePts);
	return { positions, lineGeometry };
}
