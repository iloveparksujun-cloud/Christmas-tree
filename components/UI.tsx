import React from 'react';
import { AppState } from '../types';

interface UIProps {
  appState: AppState;
  onSummon: () => void;
  onReset: () => void;
}

export const UI: React.FC<UIProps> = ({ appState, onSummon, onReset }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-12 z-10 text-gold-100 select-none">
      
      {/* Header */}
      <header className="flex justify-between items-start opacity-80 mix-blend-difference">
        <div>
          <h1 className="text-4xl font-serif tracking-widest text-[#C5A059] drop-shadow-[0_0_10px_rgba(197,160,89,0.5)]">
            ARIX
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase mt-2 text-emerald-400">
            Signature Collection
          </p>
        </div>
        <div className="text-right text-[10px] uppercase tracking-widest font-mono text-[#C5A059] opacity-60">
          <p>System: Online</p>
          <p>Protocol: Summon</p>
          <p>Status: {appState.replace('_', ' ')}</p>
        </div>
      </header>

      {/* Controls */}
      <div className="flex flex-col items-center justify-center pointer-events-auto">
        {appState === AppState.SCATTERED && (
          <button
            onClick={onSummon}
            className="group relative px-8 py-4 bg-transparent border border-[#C5A059] overflow-hidden transition-all duration-700 hover:tracking-[0.2em] hover:bg-[#C5A059]/10"
          >
            <span className="relative z-10 font-serif text-lg text-[#C5A059] group-hover:text-white transition-colors duration-500">
              INITIATE SUMMONING
            </span>
            <div className="absolute inset-0 bg-[#C5A059] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left opacity-20 blur-md"></div>
          </button>
        )}

        {appState === AppState.COMPLETED && (
          <div className="text-center animate-pulse">
            <p className="font-serif italic text-[#C5A059] text-xl mb-4 drop-shadow-md">
              "The ritual is complete."
            </p>
            <button
              onClick={onReset}
              className="text-xs uppercase tracking-widest text-emerald-500 hover:text-white transition-colors"
            >
              Disperse Energy
            </button>
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="text-center opacity-40 text-[#C5A059] text-[10px] tracking-widest font-mono">
        {appState === AppState.COMPLETED 
          ? "APPROACH THE CORE TO AGITATE THE INFECTION" 
          : "USE AUDIO FOR FULL IMMERSION"}
      </div>
    </div>
  );
};