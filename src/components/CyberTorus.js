"use client";

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function OrbitRings() {
  const groupRef = useRef();
  
  // Load the logo texture
  const logoTexture = useTexture('/Raw.png');

  useFrame((state) => {
    if (groupRef.current) {
      // Interactive tilt based on mouse position
      const targetX = (state.mouse.y * Math.PI) / 6;
      const targetY = (state.mouse.x * Math.PI) / 6;
      
      groupRef.current.rotation.x += 0.05 * (targetX - groupRef.current.rotation.x);
      groupRef.current.rotation.y += 0.05 * (targetY - groupRef.current.rotation.y);
      
      // Auto-rotate the inner rings
      groupRef.current.children[0].rotation.y += 0.005; // Ring 1
      groupRef.current.children[1].rotation.x += 0.008; // Ring 2
      groupRef.current.children[2].rotation.z -= 0.004; // Ring 3
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ring 1 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.2, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00E5FF" transparent opacity={0.6} />
      </mesh>
      
      {/* Ring 2 */}
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[4.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00E5FF" transparent opacity={0.4} />
      </mesh>
      
      {/* Ring 3 */}
      <mesh rotation={[Math.PI / 3, 0, Math.PI / 4]}>
        <torusGeometry args={[5.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#B829EA" transparent opacity={0.5} /> {/* Purple accent ring */}
      </mesh>

      {/* Center Logo Plane */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh>
          <planeGeometry args={[3, 3]} />
          <meshBasicMaterial 
            map={logoTexture} 
            transparent 
            opacity={0.8} 
            side={THREE.DoubleSide} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false}
          />
        </mesh>
      </Float>
    </group>
  );
}

export default function CyberTorus() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={1} />
        <Suspense fallback={null}>
          <OrbitRings />
        </Suspense>
      </Canvas>
    </div>
  );
}
