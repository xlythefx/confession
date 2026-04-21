import { useMemo, useRef, useLayoutEffect, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '../../hooks/useGameState';

interface Props {
  center: THREE.Vector3;
}

const FLOWER_COUNT = 14 * 20 - 80; // 200 (was 280)
const R_MIN = 2.2;
const R_MAX = 12.5;

/** Golden-angle spiral fills a wide disk without clumping. */
function buildFlowerOffsets(): { offset: THREE.Vector3; seed: number }[] {
  const arr: { offset: THREE.Vector3; seed: number }[] = [];
  const golden = 2.39996322972865332;
  for (let i = 0; i < FLOWER_COUNT; i++) {
    const t = (i + 0.5) / FLOWER_COUNT;
    const r = R_MIN + t * (R_MAX - R_MIN) + ((i * 17) % 10) * 0.06;
    const ang = i * golden;
    arr.push({
      offset: new THREE.Vector3(Math.cos(ang) * r, 0, Math.sin(ang) * r),
      seed: i,
    });
  }
  return arr;
}

type BudRuntime = {
  group: THREE.Group;
  petals: THREE.Mesh[];
  centerMat: THREE.MeshStandardMaterial;
};

// A ring / wave of little flower buds around the princess. ~20× count, much wider radius.
// One useFrame drives all buds to avoid hundreds of R3F subscriptions.
export default function BloomFlowers({ center }: Props) {
  const flowers = useMemo(() => buildFlowerOffsets(), []);
  const runtimes = useRef<(BudRuntime | null)[]>(Array.from({ length: FLOWER_COUNT }, () => null));
  const t = useRef(0);
  const state = useGameState;

  useFrame((_, dt) => {
    t.current += dt;
    const endingTriggered = state.getState().endingTriggered;
    const bloom = endingTriggered ? 1 : 0;

    for (let i = 0; i < FLOWER_COUNT; i++) {
      const br = runtimes.current[i];
      if (!br) continue;
      const g = br.group;
      const seed = flowers[i].seed;

      g.rotation.z = Math.sin(t.current + seed * 0.07) * 0.05;

      const targetScale = 0.45 + bloom * 0.75;
      const s = THREE.MathUtils.damp(g.scale.x, targetScale, 1.5, dt);
      g.scale.setScalar(s);

      const targetRot = 0.9 + bloom * 0.6;
      const ps = 0.6 + bloom * 0.7;
      for (const p of br.petals) {
        p.rotation.z = THREE.MathUtils.damp(p.rotation.z, targetRot, 1.2, dt);
        p.scale.setScalar(THREE.MathUtils.damp(p.scale.x, ps, 1.5, dt));
      }

      br.centerMat.emissiveIntensity = THREE.MathUtils.damp(
        br.centerMat.emissiveIntensity,
        0.2 + bloom * 1.3,
        1.5,
        dt,
      );
    }
  });

  return (
    <group position={center}>
      {flowers.map((f, i) => (
        <BudMount key={i} offset={f.offset} seed={f.seed} index={i} runtimes={runtimes} />
      ))}
    </group>
  );
}

function BudMount({
  offset,
  seed,
  index,
  runtimes,
}: {
  offset: THREE.Vector3;
  seed: number;
  index: number;
  runtimes: MutableRefObject<(BudRuntime | null)[]>;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const petalRefs = useRef<THREE.Mesh[]>([]);
  const centerMatRef = useRef<THREE.MeshStandardMaterial>(null!);

  useLayoutEffect(() => {
    const g = groupRef.current;
    if (!g || !centerMatRef.current) return;
    runtimes.current[index] = {
      group: g,
      petals: petalRefs.current.filter((m): m is THREE.Mesh => Boolean(m)),
      centerMat: centerMatRef.current,
    };
    return () => {
      runtimes.current[index] = null;
    };
  }, [index, runtimes]);

  const hue = (seed * 47) % 60;

  return (
    <group position={offset} ref={groupRef} scale={0.45}>
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
              <meshPhysicalMaterial
                color={new THREE.Color().setHSL(0.92 + hue * 0.001, 0.6, 0.8)}
                emissive="#ff9abf"
                emissiveIntensity={0.3}
                roughness={0.3}
                transmission={0.35}
                thickness={0.08}
                ior={1.35}
              />
            </mesh>
          );
        })}
        <mesh>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial
            ref={centerMatRef}
            color="#fff1b8"
            emissive="#ffcf6a"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}
