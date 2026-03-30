import { Environment, Float } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import {
	type MutableRefObject,
	Suspense,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import * as THREE from "three";

import { type BrandColors, getBrandColors } from "@/src/lib/brand-colors";
import { buildHeroGraph, createSeededRandom } from "@/src/lib/hero-graph";
import { buildHeroAmbientPretextCanvas } from "@/src/lib/hero-webgl-pretext-texture";

const NODE_COUNT = 60;
const GRAPH_SEED = 0x4d454367;
const CAMERA_Z_BASE = 5;
const CAMERA_Z_SCROLL = 0.85;

function InstancedGraphNodes({
	positions,
	instanceSeed,
	colors,
}: {
	positions: THREE.Vector3[];
	instanceSeed: number;
	colors: BrandColors;
}) {
	const meshRef = useRef<THREE.InstancedMesh>(null);
	const dummy = useMemo(() => new THREE.Object3D(), []);
	const warmInstance = useMemo(
		() => new THREE.Color(colors.ink).lerp(new THREE.Color(colors.accent), 0.2),
		[colors.ink, colors.accent],
	);
	const neutralInstance = useMemo(
		() => new THREE.Color(colors.nodeNeutral),
		[colors.nodeNeutral],
	);

	useLayoutEffect(() => {
		const mesh = meshRef.current;
		if (!mesh) return;
		const rng = createSeededRandom(instanceSeed ^ 0xfeedbeef);
		for (let i = 0; i < positions.length; i++) {
			dummy.position.copy(positions[i]);
			dummy.updateMatrix();
			mesh.setMatrixAt(i, dummy.matrix);
			mesh.setColorAt(i, rng() < 0.12 ? warmInstance : neutralInstance);
		}
		mesh.instanceMatrix.needsUpdate = true;
		if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
	}, [positions, dummy, instanceSeed, warmInstance, neutralInstance]);

	return (
		<instancedMesh
			ref={meshRef}
			args={[undefined, undefined, positions.length]}
		>
			<sphereGeometry args={[0.04, 16, 16]} />
			<meshStandardMaterial
				color={colors.ink}
				roughness={0.2}
				metalness={0.8}
				emissive={colors.accent}
				emissiveIntensity={0.022}
			/>
		</instancedMesh>
	);
}

function CentralCore({ colors }: { colors: BrandColors }) {
	const matRef = useRef<THREE.MeshStandardMaterial>(null);

	useFrame(({ clock }) => {
		const mat = matRef.current;
		if (!mat) return;
		const t = clock.elapsedTime;
		mat.emissiveIntensity = 0.02 + Math.sin(t * 1.2) * 0.012;
	});

	return (
		<>
			<mesh>
				<icosahedronGeometry args={[0.8, 1]} />
				<meshStandardMaterial
					color={colors.wireframeAccentTint}
					wireframe
					transparent
					opacity={0.2}
				/>
			</mesh>
			<mesh>
				<sphereGeometry args={[0.6, 32, 32]} />
				<meshStandardMaterial
					ref={matRef}
					color={colors.bg}
					roughness={0.5}
					metalness={1}
					emissive={colors.accent}
					emissiveIntensity={0.02}
				/>
			</mesh>
		</>
	);
}

type DataNetworkProps = {
	scrollProgressRef: MutableRefObject<number>;
	colors: BrandColors;
};

type AmbientTextPayload = {
	material: THREE.MeshBasicMaterial;
	planeWidth: number;
	planeHeight: number;
};

/**
 * Pretext `layoutWithLines` → canvas → `CanvasTexture` as low-contrast atmosphere
 * (DOM hero copy remains the accessible source of truth).
 */
function HeroAmbientPretextTypography({
	scrollProgressRef,
	accentHex,
}: {
	scrollProgressRef: MutableRefObject<number>;
	accentHex: string;
}) {
	const [payload, setPayload] = useState<AmbientTextPayload | null>(null);
	const payloadRef = useRef<AmbientTextPayload | null>(null);
	payloadRef.current = payload;
	const textureGenRef = useRef(0);

	useEffect(() => {
		const gen = ++textureGenRef.current;
		let cancelled = false;

		void document.fonts.ready.then(() => {
			if (cancelled || textureGenRef.current !== gen) return;
			const built = buildHeroAmbientPretextCanvas(3.45, accentHex);
			if (!built) return;

			const texture = new THREE.CanvasTexture(built.canvas);
			texture.colorSpace = THREE.SRGBColorSpace;
			texture.needsUpdate = true;
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;

			const mat = new THREE.MeshBasicMaterial({
				map: texture,
				transparent: true,
				opacity: 0.1,
				depthWrite: false,
			});
			if (cancelled || textureGenRef.current !== gen) {
				mat.dispose();
				return;
			}
			setPayload({
				material: mat,
				planeWidth: built.planeWidth,
				planeHeight: built.planeHeight,
			});
		});

		return () => {
			cancelled = true;
		};
	}, [accentHex]);

	useEffect(() => {
		if (!payload) return;
		const { material } = payload;
		return () => {
			material.dispose();
		};
	}, [payload]);

	useFrame(() => {
		const mat = payloadRef.current?.material;
		if (!mat) return;
		const p = scrollProgressRef.current;
		mat.opacity = 0.1 * (1 - p * 0.92);
	});

	if (!payload) return null;

	return (
		<mesh
			position={[0, -0.48, -2.02]}
			rotation={[0.11, 0, 0]}
			material={payload.material}
		>
			<planeGeometry args={[payload.planeWidth, payload.planeHeight]} />
		</mesh>
	);
}

function DataNetwork({ scrollProgressRef, colors }: DataNetworkProps) {
	const groupRef = useRef<THREE.Group>(null);
	const pointerSmooth = useRef({ x: 0, y: 0 });
	const { camera } = useThree();

	const { positions, lineGeometry } = useMemo(
		() => buildHeroGraph(NODE_COUNT, GRAPH_SEED),
		[],
	);

	useEffect(
		() => () => {
			lineGeometry.dispose();
		},
		[lineGeometry],
	);

	useFrame((state) => {
		const cam = camera;
		if (cam instanceof THREE.PerspectiveCamera) {
			const p = scrollProgressRef.current;
			cam.position.z = CAMERA_Z_BASE + p * CAMERA_Z_SCROLL;
		}

		if (!groupRef.current) return;

		const progress = scrollProgressRef.current;
		const spin = 1 - progress * 0.45;

		pointerSmooth.current.x +=
			(state.pointer.x * 0.32 - pointerSmooth.current.x) * 0.065;
		pointerSmooth.current.y +=
			(state.pointer.y * 0.22 - pointerSmooth.current.y) * 0.065;

		groupRef.current.rotation.x =
			state.clock.elapsedTime * 0.1 * spin + pointerSmooth.current.y * 0.14;
		groupRef.current.rotation.y =
			state.clock.elapsedTime * 0.15 * spin + pointerSmooth.current.x * 0.18;
	});

	return (
		<Float speed={1.4} rotationIntensity={0.65} floatIntensity={1.1}>
			<group ref={groupRef}>
				<InstancedGraphNodes
					positions={positions}
					instanceSeed={GRAPH_SEED}
					colors={colors}
				/>
				<lineSegments geometry={lineGeometry}>
					<lineBasicMaterial
						color={colors.graphLineWarm}
						transparent
						opacity={0.26}
					/>
				</lineSegments>
				<HeroAmbientPretextTypography
					scrollProgressRef={scrollProgressRef}
					accentHex={colors.accent}
				/>
				<CentralCore colors={colors} />
			</group>
		</Float>
	);
}

type HeroSceneProps = {
	scrollProgressRef: MutableRefObject<number>;
	colors: BrandColors;
};

function HeroScene({ scrollProgressRef, colors }: HeroSceneProps) {
	const heroFogHex = useMemo(() => {
		const c = new THREE.Color(colors.bg);
		c.lerp(new THREE.Color(colors.accentMuted), 0.12);
		return c.getHex();
	}, [colors.bg, colors.accentMuted]);

	return (
		<>
			<color attach="background" args={[colors.bg]} />
			<fog attach="fog" args={[heroFogHex, 3.8, 14.5]} />
			<ambientLight intensity={0.62} />
			<directionalLight position={[10, 10, 5]} intensity={1.2} />
			<pointLight
				position={[-5.2, 3.2, 4.5]}
				color={colors.accent}
				intensity={0.085}
				distance={22}
				decay={2}
			/>
			<hemisphereLight
				args={[colors.hemisphereWarm, colors.bg]}
				intensity={0.35}
			/>
			<DataNetwork scrollProgressRef={scrollProgressRef} colors={colors} />
			<Suspense fallback={null}>
				<Environment preset="city" />
			</Suspense>
		</>
	);
}

export type HeroWebGLCanvasProps = {
	scrollProgressRef: MutableRefObject<number>;
};

/** Deferred chunk: Three.js + R3F hero scene only (not loaded for `prefers-reduced-motion`). */
export function HeroWebGLCanvas({ scrollProgressRef }: HeroWebGLCanvasProps) {
	const { resolvedTheme } = useTheme();
	const colors = useMemo(
		() => getBrandColors(resolvedTheme === "light" ? "light" : "dark"),
		[resolvedTheme],
	);

	return (
		<Canvas
			key={resolvedTheme === "light" ? "light" : "dark"}
			className="h-full w-full touch-none"
			dpr={[1, 1.5]}
			gl={{ antialias: true, alpha: true }}
			camera={{ position: [0, 0, CAMERA_Z_BASE], fov: 42 }}
		>
			<HeroScene scrollProgressRef={scrollProgressRef} colors={colors} />
		</Canvas>
	);
}
