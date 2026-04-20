import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/game/Scene';
import IntroOverlay from './components/ui/IntroOverlay';
import GameHUD from './components/ui/GameHUD';
import EndingOverlay from './components/ui/EndingOverlay';
import { useGameState } from './hooks/useGameState';

export default function App() {
  const gameStarted = useGameState((s) => s.gameStarted);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 4, 8], fov: 55, near: 0.1, far: 120 }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {!gameStarted && <IntroOverlay />}
      {gameStarted && <GameHUD />}
      <EndingOverlay />
    </div>
  );
}
