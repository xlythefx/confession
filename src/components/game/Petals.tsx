import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Drifting pink petals (instanced billboards).
export default function Petals() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const COUNT = 140;

  const petals = useMemo(() => {
    const arr: {
      x: number;
      y: number;
      z: number;
      vy: number;
      vx: number;
      vz: number;
      phase: number;
      scale: number;
    }[] = [];
    for (let i = 0; i < COUNT; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 42,
        y: Math.random() * 8 + 0.5,
        z: (Math.random() - 0.5) * 42,
        vy: -0.06 - Math.random() * 0.07,
        vx: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
        phase: Math.random() * Math.PI * 2,
        scale: 0.55 + Math.random() * 0.65,
      });
    }
    return arr;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, dt) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.phase += dt * 1.2;
      p.x += (p.vx + Math.sin(p.phase) * 0.15) * dt;
      p.y += p.vy * dt;
      p.z += (p.vz + Math.cos(p.phase * 0.8) * 0.1) * dt;
      if (p.y < 0.1) {
        p.y = 6 + Math.random() * 2;
        p.x = (Math.random() - 0.5) * 42;
        p.z = (Math.random() - 0.5) * 42;
      }
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.phase, p.phase * 0.6, 0);
      dummy.scale.setScalar(p.scale * 0.075);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#ffc8e8"
        emissive="#ff7eb8"
        emissiveIntensity={0.55}
        transparent
        opacity={0.92}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
