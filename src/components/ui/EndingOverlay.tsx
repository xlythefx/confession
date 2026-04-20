import { useGameState } from '../../hooks/useGameState';

export default function EndingOverlay() {
  const endingTriggered = useGameState((s) => s.endingTriggered);
  const restart = useGameState((s) => s.restart);

  if (!endingTriggered) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex items-end justify-center pb-24">
      <div className="text-center fade-in" style={{ animationDuration: '3s' }}>
        <p className="text-sunset-50 text-3xl md:text-4xl font-serif italic tracking-wide drop-shadow-[0_0_18px_rgba(255,180,120,0.5)]">
          Maybe I like you a little.
        </p>
      </div>
      <button
        onClick={restart}
        className="pointer-events-auto absolute bottom-6 right-6 px-4 py-2 rounded-full border border-sunset-200/40 text-sunset-50/80 text-xs tracking-widest uppercase hover:bg-sunset-200/10 transition"
      >
        Walk again
      </button>
    </div>
  );
}
