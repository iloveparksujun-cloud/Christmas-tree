import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { ParticleMaterial } from './ParticleShader';
import { randomInSphere, pointOnCone, randomInConeCore } from '../../utils/math';
import { ParticleProps } from '../../types';

// Register the custom shader material to be available as <particleMaterial />
extend({ ParticleMaterial });

interface ExtendedParticleProps extends ParticleProps {
  progress: number; // 0 to 1 controlled by parent
  interactIntensity: number;
  mousePos: THREE.Vector3;
}

export const ParticleCloud: React.FC<ExtendedParticleProps> = ({ 
  count, 
  color, 
  size, 
  noiseStrength, 
  type,
  progress,
  interactIntensity,
  mousePos
}) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<any>(null);
  const { viewport } = useThree();

  // Generate Geometry Data once
  const { positions, treePositions, randomness } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const treePos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);

    const treeHeight = 12;
    const treeRadius = 5;

    for (let i = 0; i < count; i++) {
      // 1. Random Scattered Position (Sphere)
      const p1 = randomInSphere(15);
      pos.set([p1.x, p1.y, p1.z], i * 3);

      // 2. Tree Position (Target)
      let p2: THREE.Vector3;
      
      if (type === 'green') {
        // Main Foliage
        p2 = pointOnCone(treeHeight, treeRadius, i / count, count, i, 0.5);
      } else if (type === 'gold') {
        // Ornaments - slightly larger radius, perfect spiral
        p2 = pointOnCone(treeHeight, treeRadius * 1.05, i / count, count, i, 0.0);
      } else {
        // Red Infection - Core
        p2 = randomInConeCore(treeHeight * 0.8, treeRadius);
      }
      
      treePos.set([p2.x, p2.y, p2.z], i * 3);

      // 3. Randomness for animation offset
      rnd[i] = Math.random();
    }

    return {
      positions: pos,
      treePositions: treePos,
      randomness: rnd
    };
  }, [count, type]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
      // Smooth interpolation for progress is handled by parent, but we ensure uniform is set
      materialRef.current.uProgress = progress;
      
      // Update interaction uniforms
      materialRef.current.uInteract = type === 'red' ? interactIntensity : 0;
      materialRef.current.uMouse.copy(mousePos);
      
      // Dynamic noise for red infection
      if (type === 'red') {
        materialRef.current.uNoiseStrength = noiseStrength + (interactIntensity * 0.5);
        // Pulse size for red
        const pulse = Math.sin(state.clock.elapsedTime * 5) * 0.5 + 1.5;
        materialRef.current.uSize = size * pulse;
      }
    }
    
    // Slight rotation of the whole cloud for cinematic feel
    if (meshRef.current) {
       meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-treePosition"
          count={treePositions.length / 3}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-randomness"
          count={randomness.length}
          array={randomness}
          itemSize={1}
        />
      </bufferGeometry>
      {/* @ts-ignore */}
      <particleMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uColor={new THREE.Color(color)}
        uSize={size}
        uNoiseStrength={noiseStrength}
        uPixelRatio={Math.min(window.devicePixelRatio, 2)}
      />
    </points>
  );
};