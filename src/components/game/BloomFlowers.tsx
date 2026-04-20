import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '../../hooks/useGameState';

interface Props {
  center: THREE.Vector3;
}

// A ring of little flower buds beside the princess. They bloom (scale up,
// change color, emissive glow) when the ending is triggered.
export default function BloomFlowers({ center }: Props) {
  const flowers = useMemo(() => {
    const arr: { offset: THREE.Vector3; seed: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + (i % 3) * 0.1;
      const r = 0.7 + ((i * 13) % 5) * 0.12;
      arr.push({
        offset: new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r),
        seed: i,
      });
    }
    return arr;
  }, []);

  return (
    <group position={center}>
      {flowers.map((f, i) => (
        <Bud key={i} offset={f.offset} seed={f.seed} />
      ))}
    </group>
  );
}

function Bud({ offset, seed }: { offset: THREE.Vector3; seed: number }) {
  const group = useRef<THREE.Group>(null!);
  const centerRef = useRef<THREE.MeshStandardMaterial>(null!);
  const petalRefs = useRef<THREE.Mesh[]>([]);
  const t = useRef(seed * 0.3);

  const endingTriggered = useGameState((s) => s.endingTriggered);

  useFrame((_, dt) => {
    t.current += dt;
    if (!group.current) return;

    // Gentle idle sway.
    group.current.rotation.z = Math.sin(t.current + seed) * 0.05;

    const bloom = endingTriggered ? 1 : 0;
    const targetScale = 0.45 + bloom * 0.75;
    const s = THREE.MathUtils.damp(group.current.scale.x, targetScale, 1.5, dt);
    group.current.scale.setScalar(s);

    // Petals open: rotate outward on z and scale.
    petalRefs.current.forEach((p, i) => {
      if (!p) return;
      const targetRot = 0.9 + bloom * 0.6;
      p.rotation.z = THREE.MathUtils.damp(p.rotation.z, targetRot, 1.2, dt);
      const ps = 0.6 + bloom * 0.7;
      p.scale.setScalar(THREE.MathUtils.damp(p.scale.x, ps, 1.5, dt));
    });

    if (centerRef.current) {
      centerRef.current.emissiveIntensity = THREE.MathUtils.damp(
        centerRef.current.emissiveIntensity,
        0.2 + bloom * 1.3,
        1.5,
        dt,
      );
    }
  });

  const hue = (seed * 47) % 60; // subtle pink/peach variation

  return (
    <group position={offset} ref={group}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.16, 5]} />
        <meshStandardMaterial color="#6a8b3a" />
      </mesh>
      <group position={[0, 0.18, 0]}>
        {Array.from({ length: 5 }).map((_, i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh
              key={i}
              ref={(m) => {
                if (m) petalRefs.current[i] = m;
              }}
              position={[Math.cos(a) * 0.04, 0, Math.sin(a) * 0.04]}
              rotation={[0, -a, 0.9]}
            >
              <sphereGeometry args={[0.05, 8, 6]} />
              <meshStandardMaterial
                color={new THREE.Color().setHSL(0.92 + hue * 0.001, 0.6, 0.8)}
                emissive="#ff9abf"
                emissiveIntensity={0.25}
                roughness={0.7}
              />
            </mesh>
          );
        })}
        <mesh>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial
            ref={centerRef}
            color="#fff1b8"
            emissive="#ffcf6a"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}
