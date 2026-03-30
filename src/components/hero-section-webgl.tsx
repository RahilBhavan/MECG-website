import { Environment, Float } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
	type MutableRefObject,
	Suspense,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from "react";
import * as THREE from "three";

import { brandColors } from "@/src/lib/brand-colors";
import { buildHeroGraph, createSeededRandom } from "@/src/lib/hero-graph";

const NODE_COUNT = 60;
const GRAPH_SEED = 0x4d454367;
const CAMERA_Z_BASE = 5;
const CAMERA_Z_SCROLL = 0.85;

function InstancedGraphNodes({
	positions,
	instanceSeed,
}: {
	positions: THREE.Vector3[];
	instanceSeed: number;
}) {
	const meshRef = useRef<THREE.InstancedMesh>(null);
	const dummy = useMemo(() => new THREE.Object3D(), []);
	const warmInstance = useMemo(
		() =>
			new THREE.Color(brandColors.ink).lerp(
				new THREE.Color(brandColors.accent),
				0.2,
			),
		[],
	);
	const neutralInstance = useMemo(() => new THREE.Color(1, 1, 1), []);

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
				color={brandColors.ink}
				roughness={0.2}
				metalness={0.8}
				emissive={brandColors.accent}
				emissiveIntensity={0.022}
			/>
		</instancedMesh>
	);
}

function CentralCore() {
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
					color={brandColors.wireframeAccentTint}
					wireframe
					transparent
					opacity={0.2}
				/>
			</mesh>
			<mesh>
				<sphereGeometry args={[0.6, 32, 32]} />
				<meshStandardMaterial
					ref={matRef}
					color={brandColors.bg}
					roughness={0.5}
					metalness={1}
					emissive={brandColors.accent}
					emissiveIntensity={0.02}
				/>
			</mesh>
		</>
	);
}

type DataNetworkProps = {
	scrollProgressRef: MutableRefObject<number>;
};

function DataNetwork({ scrollProgressRef }: DataNetworkProps) {
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
				<InstancedGraphNodes positions={positions} instanceSeed={GRAPH_SEED} />
				<lineSegments geometry={lineGeometry}>
					<lineBasicMaterial
						color={brandColors.graphLineWarm}
						transparent
						opacity={0.26}
					/>
				</lineSegments>
				<CentralCore />
			</group>
		</Float>
	);
}

export type HeroWebGLCanvasProps = {
	scrollProgressRef: MutableRefObject<number>;
};

/** Deferred chunk: Three.js + R3F hero scene only (not loaded for `prefers-reduced-motion`). */
export function HeroWebGLCanvas({ scrollProgressRef }: HeroWebGLCanvasProps) {
	const heroFogHex = useMemo(() => {
		const c = new THREE.Color(brandColors.bg);
		c.lerp(new THREE.Color(brandColors.accentMuted), 0.12);
		return c.getHex();
	}, []);

	return (
		<Canvas
			className="h-full w-full touch-none"
			dpr={[1, 1.5]}
			gl={{ antialias: true, alpha: true }}
			camera={{ position: [0, 0, CAMERA_Z_BASE], fov: 42 }}
		>
			<color attach="background" args={[brandColors.bg]} />
			<fog attach="fog" args={[heroFogHex, 3.8, 14.5]} />
			<ambientLight intensity={0.62} />
			<directionalLight position={[10, 10, 5]} intensity={1.2} />
			<pointLight
				position={[-5.2, 3.2, 4.5]}
				color={brandColors.accent}
				intensity={0.085}
				distance={22}
				decay={2}
			/>
			<hemisphereLight
				args={[brandColors.hemisphereWarm, brandColors.bg]}
				intensity={0.35}
			/>
			<DataNetwork scrollProgressRef={scrollProgressRef} />
			<Suspense fallback={null}>
				<Environment preset="city" />
			</Suspense>
		</Canvas>
	);
}
