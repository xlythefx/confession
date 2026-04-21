import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
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
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        camera={{ position: [0, 5.5, 8.5], fov: 55, near: 0.1, far: 120 }}
      >
        <Suspense fallback={null}>
          <Scene />
          <EffectComposer>
            {/* Bloom: only emissives above threshold glow — lamp, flower, moon disc */}
            <Bloom
              luminanceThreshold={0.72}
              luminanceSmoothing={0.18}
              intensity={1.4}
              blendFunction={BlendFunction.ADD}
            />
            {/* Subtle vignette for cinematic framing */}
            <Vignette
              offset={0.28}
              darkness={0.55}
              blendFunction={BlendFunction.NORMAL}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {!gameStarted && <IntroOverlay />}
      {gameStarted && <GameHUD />}
      <EndingOverlay />
    </div>
  );
}
