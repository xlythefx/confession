import { useGameState } from '../../hooks/useGameState';

export default function GameHUD() {
  const hasFlower = useGameState((s) => s.hasFlower);
  const nearFlower = useGameState((s) => s.nearFlower);
  const nearPrincess = useGameState((s) => s.nearPrincess);
  const interactionLocked = useGameState((s) => s.interactionLocked);
  const endingTriggered = useGameState((s) => s.endingTriggered);

  const showPickupPrompt = nearFlower && !hasFlower && !interactionLocked;
  const showOfferPrompt =
    nearPrincess && hasFlower && !interactionLocked && !endingTriggered;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {hasFlower && (
        <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-2 rounded-full bg-black/25 backdrop-blur-sm border border-sunset-200/30 fade-in">
          <span className="text-xl" style={{ filter: 'drop-shadow(0 0 6px #ffb27a)' }}>
            🌸
          </span>
          <span className="text-sunset-50 text-xs tracking-widest uppercase">
            Flower
          </span>
        </div>
      )}

      {showPickupPrompt && (
        <PromptBubble text="Press E to pick up" />
      )}

      {showOfferPrompt && (
        <PromptBubble text="Press E to offer flower" />
      )}
    </div>
  );
}

function PromptBubble({ text }: { text: string }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-24 soft-pulse">
      <div className="px-5 py-2 rounded-full bg-black/35 backdrop-blur-sm border border-sunset-200/40 text-sunset-50 text-sm tracking-[0.25em] uppercase">
        {text}
      </div>
    </div>
  );
}
