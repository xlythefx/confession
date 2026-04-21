import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ContactShadows, Environment } from '@react-three/drei';
import World from './World';
import Tree from './Tree';
import Player from './Player';
import FollowCamera from './FollowCamera';
import GrassChunks from './GrassChunks';
import PrincessElf from './PrincessElf';
import FlowerPickup from './FlowerPickup';
import BloomFlowers from './BloomFlowers';
import Petals from './Petals';
import { useGameState } from '../../hooks/useGameState';

// World layout constants shared across components.
export const FLOWER_POS = new THREE.Vector3(2.2, 0, 2);
export const PRINCESS_POS = new THREE.Vector3(-1.2, 0, -7);
export const TREE_POS = new THREE.Vector3(0, 0, -8.5);

// 20 distant silhouettes (5 rings × 4). castShadow off on copies.
function buildDistantTrees(): { pos: [number, number, number]; scale: number }[] {
  const out: { pos: [number, number, number]; scale: number }[] = [];
  const perRing = 4;
  for (let ring = 0; ring < 5; ring++) {
    const baseR = 15.5 + ring * 5.6;
    for (let k = 0; k < perRing; k++) {
      const a = (k / perRing) * Math.PI * 2 + ring * 0.31;
      const scale = Math.min(0.52, 0.3 + ring * 0.026 + (k % 6) * 0.014);
      let chosen: [number, number, number] = [0, 0, 0];
      for (const bump of [0, 3.5, 7, 10.5]) {
        const R = baseR + bump;
        const x = Math.cos(a) * R;
        const z = Math.sin(a) * R;
        const v = new THREE.Vector3(x, 0, z);
        const clear =
          v.distanceTo(TREE_POS) >= 5.4 &&
          v.distanceTo(PRINCESS_POS) >= 3.9 &&
          v.distanceTo(FLOWER_POS) >= 3.1;
        chosen = [x, 0, z];
        if (clear) break;
      }
      out.push({ pos: chosen, scale });
    }
  }
  return out;
}

const DISTANT_TREES = buildDistantTrees();

export default function Scene() {
  const playerRef = useRef<THREE.Group>(null);

  const setNearFlower = useGameState((s) => s.setNearFlower);
  const setNearPrincess = useGameState((s) => s.setNearPrincess);
  const hasFlower = useGameState((s) => s.hasFlower);

  // Proximity checks — cheap, once per frame.
  useFrame(() => {
    if (!playerRef.current) return;
    const p = playerRef.current.position;
    if (!hasFlower) {
      setNearFlower(p.distanceTo(FLOWER_POS) < 1.3);
    } else {
      setNearFlower(false);
    }
    setNearPrincess(p.distanceTo(PRINCESS_POS) < 2.0);
  });

  return (
    <>
      {/* Moonlit: cool ambient + sky/ground bounce + moon key */}
      <ambientLight intensity={0.32} color="#5a6d8a" />
      <hemisphereLight args={['#7a9cbd', '#1a2230', 0.55]} />
      <directionalLight
        position={[-11, 20, 7]}
        intensity={0.52}
        color="#c5daf5"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
      {/* Soft silver fill from the moon side so faces stay readable */}
      <directionalLight position={[14, 6, -10]} intensity={0.12} color="#8899b8" castShadow={false} />

      {/* Night HDRI — background=false keeps sky from being replaced; only reflections/spec */}
      <Environment preset="night" background={false} />

      {/* Soft baked contact shadows for grounding — frames=Infinity re-renders every frame */}
      <ContactShadows
        position={[0, 0.004, 0]}
        scale={28}
        blur={2.8}
        far={1.5}
        opacity={0.45}
        frames={Infinity}
        color="#0a1828"
      />

      {/* Far mist: bluish veil at distance; masks grass chunk pop-in */}
      <fog attach="fog" args={['#2a3c52', 14, 52]} />
      <color attach="background" args={['#0f1828']} />

      <World />
      <Tree position={TREE_POS.toArray()} />
      {DISTANT_TREES.map(({ pos, scale }, i) => (
        <group key={i} position={pos} scale={scale}>
          <Tree position={[0, 0, 0]} castShadow={false} />
        </group>
      ))}
      <PrincessElf position={PRINCESS_POS.toArray()} />
      <BloomFlowers center={PRINCESS_POS} />
      <FlowerPickup position={FLOWER_POS.toArray()} />
      <Petals />

      <Player ref={playerRef} />
      <GrassChunks playerRef={playerRef} />
      <FollowCamera targetRef={playerRef} />
    </>
  );
}
