import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ParticleCloud } from './Visuals/ParticleCloud';
import { AppState } from '../types';
import { audioManager } from '../utils/audio';

interface SceneProps {
  appState: AppState;
}

export const Scene: React.FC<SceneProps> = ({ appState }) => {
  const { camera, pointer, raycaster, viewport } = useThree();
  
  // Animation Progress Refs (0 to 1)
  const progressCore = useRef(0);
  const progressMass = useRef(0);
  const progressGold = useRef(0);
  
  // Interaction Logic
  const mousePos = useRef(new THREE.Vector3(0, 0, 0));
  const interactIntensity = useRef(0);

  // Helper for smooth damping
  const damp = (current: number, target: number, speed: number, delta: number) => {
    return THREE.MathUtils.damp(current, target, speed, delta);
  };

  useFrame((state, delta) => {
    // 1. Manage State Transitions
    // Order: Core (Red) -> Mass (Green) -> Gold (Ornaments)
    
    const targetCore = appState !== AppState.SCATTERED ? 1 : 0;
    const targetMass = (appState === AppState.FORMING_MASS || appState === AppState.FORMING_GOLD || appState === AppState.COMPLETED) ? 1 : 0;
    const targetGold = (appState === AppState.FORMING_GOLD || appState === AppState.COMPLETED) ? 1 : 0;

    // Different speeds create "unease"
    progressCore.current = damp(progressCore.current, targetCore, 1.5, delta); // Fast, erratic spike
    progressMass.current = damp(progressMass.current, targetMass, 0.8, delta); // Slow, heavy easing
    progressGold.current = damp(progressGold.current, targetGold, 3.0, delta); // Sharp lock-in

    // 2. Raycasting for "3D Mouse Position" roughly on plane z=0
    // This allows particles to react to mouse in 3D space
    mousePos.current.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, 0);

    // 3. Interaction Intensity (Distance from center or movement)
    // If mouse is near center, intensity goes up
    const distToCenter = mousePos.current.length();
    const targetIntensity = distToCenter < 5 ? 1.0 : 0.0;
    interactIntensity.current = damp(interactIntensity.current, targetIntensity, 2, delta);
    
    // Audio modulation
    audioManager.setDroneIntensity(interactIntensity.current * progressCore.current);
  });
  
  // Random audio triggers for ambience
  useEffect(() => {
    if (appState === AppState.SCATTERED) return;
    
    const interval = setInterval(() => {
       if (Math.random() > 0.7) {
         audioManager.triggerBell();
       }
    }, 2000);
    return () => clearInterval(interval);
  }, [appState]);

  return (
    <>
      <color attach="background" args={['#000502']} />
      
      {/* 1. The Infection (Core) - Red */}
      <ParticleCloud
        count={500}
        color="#ff1a1a"
        size={60}
        noiseStrength={0.8} // High noise
        type="red"
        progress={progressCore.current}
        interactIntensity={interactIntensity.current}
        mousePos={mousePos.current}
      />

      {/* 2. The Order (Foliage) - Deep Emerald */}
      <ParticleCloud
        count={6000} // High density
        color="#006b3c" // Emerald
        size={45}
        noiseStrength={0.3} // Gentle breathing
        type="green"
        progress={progressMass.current}
        interactIntensity={0}
        mousePos={mousePos.current}
      />

      {/* 3. The Power (Ornaments) - Gold */}
      <ParticleCloud
        count={300}
        color="#FFD700"
        size={90} // Large
        noiseStrength={0.1} // Static, locked
        type="gold"
        progress={progressGold.current}
        interactIntensity={0}
        mousePos={mousePos.current}
      />

      {/* Cinematic Post Processing */}
      <EffectComposer disableNormalPass>
        {/* Very High Threshold to only bloom bright spots */}
        <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.6} />
        <Noise opacity={0.15} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
      
      {/* Lighting for scene ambience (though particles are self-illuminated) */}
      <ambientLight intensity={0.2} />
    </>
  );
};