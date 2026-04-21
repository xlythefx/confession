import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ORANGE = '#e07020';
const ORANGE_DARK = '#c55a12';
const ORANGE_LIGHT = '#f5a050';
const CREAM = '#fff4e8';

// Chibi orange tabby loaf beside the princess — still primitives, reads clearly as a cat.
export default function PicnicCat() {
  const tailRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);
  const t = useRef(0);

  const { tailCurve, tailGeometry } = useMemo(() => {
    // Single smooth curve in tail-local space (base at origin, flush with rump).
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.02, 0.02),
      new THREE.Vector3(-0.07, 0.05, -0.06),
      new THREE.Vector3(-0.15, 0.08, -0.13),
      new THREE.Vector3(-0.26, 0.09, -0.22),
      new THREE.Vector3(-0.36, 0.08, -0.3),
    ]);
    const tailGeometry = new THREE.TubeGeometry(tailCurve, 36, 0.036, 8, false);
    return { tailCurve, tailGeometry };
  }, []);

  useEffect(() => {
    return () => tailGeometry.dispose();
  }, [tailGeometry]);

  useFrame((_, dt) => {
    t.current += dt;
    const s = Math.sin(t.current * 2.2);
    if (tailRef.current) {
      // Gentle wag only — large Y/Z twist on segmented cylinders caused “broken” tail look.
      tailRef.current.rotation.z = s * 0.12;
      tailRef.current.rotation.x = s * 0.04;
    }
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(t.current * 1.6) * 0.04;
    }
  });

  const tailEnd = useMemo(() => tailCurve.getPoint(1), [tailCurve]);

  return (
    <group position={[0.92, 0, 0.58]} rotation={[0, -0.35, 0]}>
      {/* Main torso — horizontal loaf (elongated Z), not a ball */}
      <mesh castShadow position={[0, 0.11, 0.06]} rotation={[0.08, 0, 0]} scale={[1.05, 0.78, 1.35]}>
        <sphereGeometry args={[0.19, 14, 12]} />
        <meshStandardMaterial color={ORANGE} roughness={0.82} />
      </mesh>
      {/* Tabby stripes (flat boxes) */}
      <mesh position={[0, 0.16, 0.12]} rotation={[0.1, 0, 0.06]} scale={[0.14, 0.04, 0.22]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={ORANGE_DARK} roughness={0.9} />
      </mesh>
      <mesh position={[0.02, 0.14, -0.08]} rotation={[0.05, 0, -0.1]} scale={[0.12, 0.035, 0.18]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={ORANGE_DARK} roughness={0.9} />
      </mesh>

      {/* Rump / back haunches */}
      <mesh castShadow position={[-0.1, 0.1, -0.14]} scale={[1.15, 0.88, 1.05]}>
        <sphereGeometry args={[0.11, 10, 8]} />
        <meshStandardMaterial color={ORANGE} roughness={0.84} />
      </mesh>

      {/* Front paws — two distinct “loaf paws” */}
      <mesh castShadow position={[-0.1, 0.02, 0.2]} rotation={[0.05, 0, 0.08]} scale={[1, 0.55, 1.15]}>
        <sphereGeometry args={[0.065, 8, 6]} />
        <meshStandardMaterial color={ORANGE_LIGHT} roughness={0.86} />
      </mesh>
      <mesh castShadow position={[0.1, 0.02, 0.18]} rotation={[0.05, 0, -0.06]} scale={[1, 0.55, 1.1]}>
        <sphereGeometry args={[0.065, 8, 6]} />
        <meshStandardMaterial color={ORANGE_LIGHT} roughness={0.86} />
      </mesh>
      {/* Back paws tucked */}
      <mesh castShadow position={[-0.14, 0.02, -0.06]}>
        <sphereGeometry args={[0.055, 6, 6]} />
        <meshStandardMaterial color={ORANGE_DARK} roughness={0.88} />
      </mesh>
      <mesh castShadow position={[0.06, 0.02, -0.12]}>
        <sphereGeometry args={[0.052, 6, 6]} />
        <meshStandardMaterial color={ORANGE_DARK} roughness={0.88} />
      </mesh>

      {/* Head + face */}
      <group ref={headRef} position={[0.06, 0.32, 0.2]}>
        <mesh castShadow scale={[1.08, 0.98, 1.12]}>
          <sphereGeometry args={[0.14, 14, 12]} />
          <meshStandardMaterial color={ORANGE} roughness={0.8} />
        </mesh>
        {/* Snout wedge — reads as muzzle forward */}
        <mesh position={[0.02, -0.02, 0.12]} rotation={[-0.15, 0, 0]} scale={[0.85, 0.75, 1.2]}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color={CREAM} roughness={0.88} />
        </mesh>
        {/* Triangular ears */}
        <mesh position={[-0.1, 0.12, 0.02]} rotation={[0, 0, -0.55]}>
          <coneGeometry args={[0.04, 0.14, 4]} />
          <meshStandardMaterial color={ORANGE_DARK} roughness={0.85} flatShading />
        </mesh>
        <mesh position={[0.1, 0.11, 0.02]} rotation={[0, 0, 0.55]}>
          <coneGeometry args={[0.04, 0.14, 4]} />
          <meshStandardMaterial color={ORANGE_DARK} roughness={0.85} flatShading />
        </mesh>
        <mesh position={[-0.095, 0.1, 0.05]} rotation={[0, 0, -0.55]}>
          <coneGeometry args={[0.022, 0.07, 3]} />
          <meshStandardMaterial color="#ffb0c8" roughness={0.9} />
        </mesh>
        <mesh position={[0.095, 0.09, 0.05]} rotation={[0, 0, 0.55]}>
          <coneGeometry args={[0.022, 0.07, 3]} />
          <meshStandardMaterial color="#ffb0c8" roughness={0.9} />
        </mesh>
        {/* Eyes — slightly larger almond placement */}
        <mesh position={[-0.06, 0.02, 0.14]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial color="#0a0806" />
        </mesh>
        <mesh position={[0.06, 0.015, 0.14]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial color="#0a0806" />
        </mesh>
        <mesh position={[-0.052, 0.028, 0.152]}>
          <sphereGeometry args={[0.008, 5, 5]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0.068, 0.022, 0.152]}>
          <sphereGeometry args={[0.008, 5, 5]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
        </mesh>
        {/* Nose */}
        <mesh position={[0.01, -0.04, 0.175]}>
          <sphereGeometry args={[0.016, 6, 6]} />
          <meshStandardMaterial color="#ff7090" roughness={0.65} />
        </mesh>
        {/* Whiskers */}
        {[-1, 0, 1].map((o) => (
          <mesh key={`wl${o}`} position={[-0.08 + o * 0.02, -0.03, 0.16]} rotation={[0, 0.35 + o * 0.08, 0]}>
            <boxGeometry args={[0.14, 0.008, 0.008]} />
            <meshStandardMaterial color="#2a2420" roughness={0.95} />
          </mesh>
        ))}
        {[-1, 0, 1].map((o) => (
          <mesh key={`wr${o}`} position={[0.06 + o * 0.02, -0.03, 0.16]} rotation={[0, -0.35 - o * 0.08, 0]}>
            <boxGeometry args={[0.14, 0.008, 0.008]} />
            <meshStandardMaterial color="#2a2420" roughness={0.95} />
          </mesh>
        ))}
      </group>

      {/* One continuous tail mesh (tube along curve) — avoids floating cylinder segments */}
      <group ref={tailRef} position={[-0.14, 0.12, -0.16]} rotation={[0.15, -0.25, 0.08]}>
        <mesh castShadow geometry={tailGeometry}>
          <meshStandardMaterial color={ORANGE_DARK} roughness={0.88} />
        </mesh>
        <mesh position={[tailEnd.x, tailEnd.y, tailEnd.z]}>
          <sphereGeometry args={[0.042, 8, 8]} />
          <meshStandardMaterial color="#fff8f0" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}
