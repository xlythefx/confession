import { useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  position?: [number, number, number];
}

// Stylized low-poly tree: trunk cylinder + layered blob foliage.
export default function Tree({ position = [0, 0, 0] }: Props) {
  const foliagePositions = useMemo(
    () => [
      [0, 3.0, 0, 1.7],
      [-1.1, 2.6, 0.4, 1.3],
      [1.0, 2.8, -0.3, 1.25],
      [0.2, 3.6, -0.5, 1.15],
      [-0.3, 3.2, 0.9, 1.1],
    ] as const,
    [],
  );

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh castShadow receiveShadow position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 2.6, 8]} />
        <meshStandardMaterial color="#6b4327" roughness={1} flatShading />
      </mesh>
      {/* Roots */}
      <mesh position={[0, 0.1, 0]}>
        <coneGeometry args={[0.9, 0.25, 8]} />
        <meshStandardMaterial color="#5a3721" roughness={1} />
      </mesh>
      {/* Foliage blobs */}
      {foliagePositions.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#9ec067' : '#c7a04a'}
            roughness={0.95}
            flatShading
          />
        </mesh>
      ))}
      {/* Soft patch of grass ring under the tree */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <circleGeometry args={[2.4, 20]} />
        <meshStandardMaterial color="#5f7a3d" roughness={1} transparent opacity={0.82} />
      </mesh>
    </group>
  );
}
