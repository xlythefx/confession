import { useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  position?: [number, number, number];
  /** Distant copies should not cast shadows (saves GPU when many instances). */
  castShadow?: boolean;
}

// Winter stylized tree: trunk, branches, layered foliage with snow caps.
export default function Tree({ position = [0, 0, 0], castShadow: doCast = true }: Props) {
  const foliagePositions = useMemo(
    () =>
      [
        [0, 3.0, 0, 1.7],
        [-1.1, 2.6, 0.4, 1.3],
        [1.0, 2.8, -0.3, 1.25],
        [0.2, 3.6, -0.5, 1.15],
        [-0.3, 3.2, 0.9, 1.1],
        [-0.85, 2.35, -0.55, 0.85],
        [0.75, 2.5, 0.65, 0.78],
        [0.45, 3.45, 0.35, 0.72],
        [-0.5, 3.0, -0.85, 0.68],
        [1.15, 3.1, 0.2, 0.62],
      ] as const,
    [],
  );

  const branchAngles = useMemo(
    () =>
      [
        [0.35, 1.9, 0.15, 0.12, 2.1, -0.55],
        [-0.4, 1.75, -0.1, -0.15, 1.95, 0.5],
        [0.1, 2.35, 0.45, 0.08, 2.55, 0.35],
      ] as const,
    [],
  );

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh castShadow={doCast} receiveShadow position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 2.6, 10]} />
        <meshStandardMaterial color="#5c3d26" roughness={0.94} metalness={0.05} flatShading />
      </mesh>
      {/* Snow strip on trunk top */}
      <mesh position={[0, 2.42, 0]}>
        <cylinderGeometry args={[0.32, 0.38, 0.22, 10]} />
        <meshStandardMaterial color="#f0f6ff" roughness={0.65} metalness={0.02} />
      </mesh>
      {/* Roots */}
      <mesh position={[0, 0.1, 0]}>
        <coneGeometry args={[0.9, 0.25, 10]} />
        <meshStandardMaterial color="#4a301c" roughness={0.98} metalness={0.02} />
      </mesh>

      {/* Side branches */}
      {branchAngles.map(([x0, y0, z0, x1, y1, z1], i) => {
        const start = new THREE.Vector3(x0, y0, z0);
        const end = new THREE.Vector3(x1, y1, z1);
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const len = start.distanceTo(end);
        const dir = end.clone().sub(start).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        return (
          <mesh key={`br-${i}`} position={mid.toArray()} quaternion={quat} castShadow={doCast}>
            <cylinderGeometry args={[0.06, 0.04, len, 6]} />
            <meshStandardMaterial color="#4d3520" roughness={0.95} />
          </mesh>
        );
      })}

      {/* Foliage — subdiv 1 on larger blobs for smoother winter silhouette */}
      {foliagePositions.map(([x, y, z, r], i) => {
        const subdiv = r > 1.0 ? 1 : 0;
        const frost = i % 2 === 0;
        return (
          <group key={i} position={[x, y, z]}>
            <mesh castShadow={doCast}>
              <icosahedronGeometry args={[r, subdiv]} />
              <meshPhysicalMaterial
                color={frost ? '#8aab78' : '#a8b888'}
                roughness={0.82}
                flatShading={subdiv === 0}
                sheen={0.55}
                sheenRoughness={0.45}
                sheenColor="#e8f4e0"
              />
            </mesh>
            {/* Snow cap */}
            <mesh position={[0, r * 0.72, 0]} scale={[1.05, 0.38, 1.05]}>
              <sphereGeometry args={[r * 0.52, 10, 8]} />
              <meshStandardMaterial
                color="#f5fbff"
                roughness={0.55}
                metalness={0.04}
                transparent
                opacity={0.92}
              />
            </mesh>
          </group>
        );
      })}

      {/* Under-tree snowy turf ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <circleGeometry args={[2.6, 28]} />
        <meshStandardMaterial color="#7a9080" roughness={1} transparent opacity={0.88} />
      </mesh>
    </group>
  );
}
