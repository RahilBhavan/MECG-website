import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function DataNetwork() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  const nodeCount = 60;
  const { nodes, lineGeometry } = useMemo(() => {
    const pts = [];
    for (let i = 0; i < nodeCount; i++) {
      const r = 1.2 + Math.random() * 1.5;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      pts.push(new THREE.Vector3(x, y, z));
    }

    const linePts = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (pts[i].distanceTo(pts[j]) < 1.6) {
          linePts.push(pts[i], pts[j]);
        }
      }
    }
    const geom = new THREE.BufferGeometry().setFromPoints(linePts);
    return { nodes: pts, lineGeometry: geom };
  }, []);

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <group ref={groupRef}>
        {nodes.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.8} emissive="#333333" />
          </mesh>
        ))}
        <lineSegments geometry={lineGeometry}>
          <lineBasicMaterial color="#555555" transparent opacity={0.4} />
        </lineSegments>
        
        {/* Central Core */}
        <mesh>
          <icosahedronGeometry args={[0.8, 1]} />
          <meshStandardMaterial color="#222222" wireframe transparent opacity={0.3} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={1} />
        </mesh>
      </group>
    </Float>
  );
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const lines = svgRef.current.querySelectorAll('.tech-line');
    
    // Set initial state
    gsap.set(lines, { strokeDasharray: 1000, strokeDashoffset: 1000 });
    
    // Animate lines drawing in
    gsap.to(lines, {
      strokeDashoffset: 0,
      duration: 2,
      ease: 'power3.inOut',
      stagger: 0.2,
      delay: 0.5,
    });

    // Parallax Effects
    if (sectionRef.current && canvasContainerRef.current && svgRef.current) {
      // Move the 3D canvas down slightly as we scroll
      gsap.to(canvasContainerRef.current, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Move the SVG annotations up slightly as we scroll
      gsap.to(svgRef.current, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* 3D Canvas Background */}
      <div ref={canvasContainerRef} className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <DataNetwork />
          <Environment preset="city" />
        </Canvas>
      </div>

      {/* SVG Annotations */}
      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4">
            <circle cx="5" cy="5" r="5" className="tech-node" />
          </marker>
        </defs>
        {/* Strategy Line */}
        <polyline
          points="15%,20% 30%,20% 40%,35%"
          className="tech-line"
          markerStart="url(#dot)"
          markerEnd="url(#dot)"
        />
        {/* Entertainment Line */}
        <polyline
          points="85%,30% 70%,30% 60%,40%"
          className="tech-line"
          markerStart="url(#dot)"
          markerEnd="url(#dot)"
        />
        {/* Data Analytics Line */}
        <polyline
          points="20%,80% 35%,80% 45%,65%"
          className="tech-line"
          markerStart="url(#dot)"
          markerEnd="url(#dot)"
        />
      </svg>

      {/* Content Overlay */}
      <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-6 pointer-events-none">
        {/* Header */}
        <header className="absolute top-8 left-6 right-6 flex justify-between items-center text-technical">
          <div>MECG // CONSULTING</div>
          <div className="flex gap-8">
            <span className="pointer-events-auto interactive cursor-pointer hover:text-white transition-colors">Work</span>
            <span className="pointer-events-auto interactive cursor-pointer hover:text-white transition-colors">About</span>
            <span className="pointer-events-auto interactive cursor-pointer hover:text-white transition-colors">Contact</span>
          </div>
        </header>

        {/* Annotations Text */}
        <div className="absolute top-[18%] left-[10%] text-technical">
          [01] STRATEGY
        </div>
        <div className="absolute top-[28%] right-[10%] text-technical text-right">
          ENTERTAINMENT [02]
        </div>
        <div className="absolute top-[78%] left-[15%] text-technical">
          [03] DATA ANALYTICS
        </div>

        {/* Main Headlines */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center pointer-events-none">
          <h1 className="text-massive mb-6 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] leading-none">
            STRATEGY,<br />
            BY DESIGN.
          </h1>
          <p className="text-technical max-w-md mx-auto bg-black/40 backdrop-blur-md p-4 rounded border border-white/10">
            MULTIFACETED. DRIVEN. INCLUSIVE.
          </p>
        </div>
      </div>
    </section>
  );
}
