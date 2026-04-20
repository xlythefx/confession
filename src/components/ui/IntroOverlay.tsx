import { useState } from 'react';
import { useGameState } from '../../hooks/useGameState';

export default function IntroOverlay() {
  const startGame = useGameState((s) => s.startGame);
  const [leaving, setLeaving] = useState(false);

  const onStart = () => {
    setLeaving(true);
    setTimeout(() => startGame(), 900);
  };

  return (
    <div
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-[900ms] ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(120, 160, 220, 0.12) 0%, rgba(8, 14, 28, 0.94) 68%)',
      }}
    >
      <div className="text-center px-8 fade-in">
        <p className="text-slate-200 text-3xl md:text-5xl font-serif tracking-wide italic drop-shadow-[0_0_20px_rgba(180,210,255,0.25)]">
          Under the moon, the meadow waits...
        </p>
        <button
          onClick={onStart}
          className="mt-16 px-8 py-3 rounded-full border border-slate-400/50 text-slate-100 text-lg tracking-widest uppercase hover:bg-slate-300/10 hover:border-slate-300/70 transition-all duration-500 backdrop-blur-sm"
        >
          Start Walking
        </button>
        <p className="mt-14 text-slate-400/80 text-xs tracking-[0.3em] uppercase">
          WASD to move &middot; Shift to hurry &middot; E to interact
        </p>
      </div>
    </div>
  );
}
