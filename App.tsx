import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { AppState } from './types';
import { audioManager } from './utils/audio';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SCATTERED);

  // Sequence Controller
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (appState === AppState.FORMING_CORE) {
      // Step 1: Core forms (Red), wait 2s
      timeout = setTimeout(() => setAppState(AppState.FORMING_MASS), 2000);
    } else if (appState === AppState.FORMING_MASS) {
      // Step 2: Mass forms (Green), wait 2.5s
      timeout = setTimeout(() => setAppState(AppState.FORMING_GOLD), 2500);
    } else if (appState === AppState.FORMING_GOLD) {
      // Step 3: Gold locks in, wait 1s then Complete
      timeout = setTimeout(() => setAppState(AppState.COMPLETED), 1500);
    }

    return () => clearTimeout(timeout);
  }, [appState]);

  const handleSummon = () => {
    audioManager.init(); // Initialize audio context on user gesture
    audioManager.startDrone();
    setAppState(AppState.FORMING_CORE);
  };

  const handleReset = () => {
    setAppState(AppState.SCATTERED);
    // Optional: Fade audio out handled by manager logic or simple stop
  };

  return (
    <div className="w-full h-screen bg-[#000502] overflow-hidden relative">
      <UI appState={appState} onSummon={handleSummon} onReset={handleReset} />
      
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 25], fov: 45 }}
          dpr={[1, 2]} // Optimize pixel ratio
          gl={{ 
            antialias: false, 
            toneMapping: 3, // ACESFilmic
            toneMappingExposure: 1.2
          }}
        >
          <Scene appState={appState} />
        </Canvas>
      </div>
    </div>
  );
};

export default App;