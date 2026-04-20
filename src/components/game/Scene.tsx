import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
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
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      {/* Soft silver fill from the moon side so faces stay readable */}
      <directionalLight position={[14, 6, -10]} intensity={0.12} color="#8899b8" castShadow={false} />

      {/* Far mist: bluish veil at distance; masks grass chunk pop-in */}
      <fog attach="fog" args={['#2a3c52', 14, 52]} />
      <color attach="background" args={['#0f1828']} />

      <World />
      <Tree position={TREE_POS.toArray()} />
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
