import { RefObject, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  CHUNK_GRID_RADIUS,
  generateBladesForChunk,
  worldToChunk,
} from '../../utils/chunkHelpers';

interface Props {
  playerRef: RefObject<THREE.Group>;
}

// Approx max blades visible = chunks * bladesPerChunk.
// With radius 3 → 7×7 chunks × 52 blades. InstancedMesh keeps it cheap.
const BLADES_PER_CHUNK = 52;
const TOTAL_INSTANCES =
  (CHUNK_GRID_RADIUS * 2 + 1) *
  (CHUNK_GRID_RADIUS * 2 + 1) *
  BLADES_PER_CHUNK;

export default function GrassChunks({ playerRef }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const lastChunk = useRef<{ cx: number; cz: number }>({ cx: 9999, cz: 9999 });
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  // Blade geometry — a short thin pyramid, super cheap.
  const geometry = useMemo(() => {
    const g = new THREE.ConeGeometry(0.04, 0.45, 4, 1);
    g.translate(0, 0.225, 0);
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#7a8f6a',
        roughness: 1,
        flatShading: true,
      }),
    [],
  );

  const rebuild = (cx: number, cz: number) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    let i = 0;
    for (let dz = -CHUNK_GRID_RADIUS; dz <= CHUNK_GRID_RADIUS; dz++) {
      for (let dx = -CHUNK_GRID_RADIUS; dx <= CHUNK_GRID_RADIUS; dx++) {
        const blades = generateBladesForChunk(cx + dx, cz + dz, BLADES_PER_CHUNK);
        for (const b of blades) {
          dummy.position.set(b.x, 0, b.z);
          dummy.rotation.set(0, b.rot, 0);
          dummy.scale.set(b.scale, b.scale, b.scale);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          // Moonlit grass: blue-green to muted sage.
          color.setHSL(0.22 + b.tint * 0.05, 0.28, 0.32 + b.tint * 0.12);
          mesh.setColorAt(i, color);
          i++;
        }
      }
    }
    // Zero any unused instances (shouldn't happen if counts are consistent).
    for (; i < TOTAL_INSTANCES; i++) {
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };

  useFrame(() => {
    const p = playerRef.current;
    if (!p) return;
    const { cx, cz } = worldToChunk(p.position.x, p.position.z);
    if (cx !== lastChunk.current.cx || cz !== lastChunk.current.cz) {
      lastChunk.current = { cx, cz };
      rebuild(cx, cz);
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, TOTAL_INSTANCES]}
      castShadow={false}
      receiveShadow
    />
  );
}
