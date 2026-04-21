import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Many drifting pink petals — large, bright instanced discs.
export default function Petals() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const COUNT = 420;

  const petals = useMemo(() => {
    return Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 52,
      y: Math.random() * 11 + 0.6,
      z: (Math.random() - 0.5) * 52,
      vy: -0.038 - Math.random() * 0.048,
      vx: (Math.random() - 0.5) * 0.16,
      vz: (Math.random() - 0.5) * 0.16,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.75 + Math.random() * 0.9,
      scale: 0.65 + Math.random() * 0.95,
      tint: Math.random(),
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame((_, dt) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.phase += dt * p.phaseSpeed;

      p.x += (p.vx + Math.sin(p.phase) * 0.16) * dt;
      p.y += p.vy * dt;
      p.z += (p.vz + Math.cos(p.phase * 0.75) * 0.14) * dt;

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.phase * 0.5, p.phase * 0.35, p.phase * 0.2);
      // Larger on-screen petals
      dummy.scale.setScalar(p.scale * 0.11);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const heightFade = Math.min(1, p.y / 1.5);
      color.setHSL(0.9 + p.tint * 0.08, 0.62 + p.tint * 0.18, 0.78 + p.tint * 0.18);
      color.multiplyScalar(0.55 + 0.45 * heightFade);
      mesh.setColorAt(i, color);

      if (p.y < 0.04) {
        p.y = 8 + Math.random() * 4;
        p.x = (Math.random() - 0.5) * 52;
        p.z = (Math.random() - 0.5) * 52;
        p.vx = (Math.random() - 0.5) * 0.16;
        p.vz = (Math.random() - 0.5) * 0.16;
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <circleGeometry args={[1, 8]} />
      <meshStandardMaterial
        color="#ffd0f0"
        emissive="#ff6eb4"
        emissiveIntensity={0.95}
        transparent
        opacity={0.98}
        side={THREE.DoubleSide}
        depthWrite={false}
        vertexColors
      />
    </instancedMesh>
  );
}
