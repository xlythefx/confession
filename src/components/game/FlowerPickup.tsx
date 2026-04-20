import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '../../hooks/useGameState';

interface Props {
  position?: [number, number, number];
}

export default function FlowerPickup({ position = [0, 0, 0] }: Props) {
  const group = useRef<THREE.Group>(null!);
  const glow = useRef<THREE.PointLight>(null!);
  const t = useRef(0);
  const hasFlower = useGameState((s) => s.hasFlower);

  useFrame((_, dt) => {
    t.current += dt;
    if (!group.current) return;
    // Float and slow spin.
    group.current.position.y = 0.45 + Math.sin(t.current * 1.8) * 0.06;
    group.current.rotation.y += dt * 0.7;
    // Fade out smoothly when picked up.
    const targetScale = hasFlower ? 0 : 1;
    const s = THREE.MathUtils.damp(group.current.scale.x, targetScale, 4, dt);
    group.current.scale.setScalar(s);
    if (glow.current) {
      glow.current.intensity = THREE.MathUtils.damp(
        glow.current.intensity,
        hasFlower ? 0 : 0.9,
        4,
        dt,
      );
    }
  });

  return (
    <group position={position}>
      <group ref={group}>
        {/* Stem */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
          <meshStandardMaterial color="#6a8b3a" />
        </mesh>
        {/* Petals */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.08, 0, Math.sin(a) * 0.08]} rotation={[0, -a, 0.8]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <meshStandardMaterial
                color="#ffd5ec"
                emissive="#ff8cc2"
                emissiveIntensity={0.4}
                roughness={0.6}
              />
            </mesh>
          );
        })}
        {/* Center */}
        <mesh>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshStandardMaterial
            color="#fff2a8"
            emissive="#ffd46a"
            emissiveIntensity={1.2}
          />
        </mesh>
        <pointLight ref={glow} color="#ffd4a8" intensity={0.9} distance={3} decay={2} />
      </group>
    </group>
  );
}
