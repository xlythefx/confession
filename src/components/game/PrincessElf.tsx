import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '../../hooks/useGameState';
import PicnicCat from './PicnicCat';

interface Props {
  position?: [number, number, number];
}

// A sleeping chibi elf girl under the tree. Built from primitives.
// Breathes subtly, and during the ending she tilts awake and smiles.
export default function PrincessElf({ position = [0, 0, 0] }: Props) {
  const bodyRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);
  const mouthRef = useRef<THREE.Mesh>(null!);
  const lidLRef = useRef<THREE.Mesh>(null!);
  const lidRRef = useRef<THREE.Mesh>(null!);
  const t = useRef(0);

  const state = useGameState;

  useFrame((_, dt) => {
    t.current += dt;
    const { endingTriggered } = state.getState();

    // Gentle breathing.
    const breathe = Math.sin(t.current * 1.4) * 0.02;
    if (bodyRef.current) bodyRef.current.position.y = 0.18 + breathe;

    // Ending: tilt head toward the player (+Z direction because she sits up slightly).
    if (headRef.current) {
      const targetTilt = endingTriggered ? 0.35 : 0.05 + Math.sin(t.current * 1.3) * 0.02;
      headRef.current.rotation.x = THREE.MathUtils.damp(
        headRef.current.rotation.x,
        targetTilt,
        2,
        dt,
      );
      const targetYaw = endingTriggered ? 0.6 : 0;
      headRef.current.rotation.y = THREE.MathUtils.damp(
        headRef.current.rotation.y,
        targetYaw,
        1.5,
        dt,
      );
    }

    // Opening eyes + slight smile on ending.
    const lidTarget = endingTriggered ? 0.12 : 1;
    if (lidLRef.current) {
      lidLRef.current.scale.y = THREE.MathUtils.damp(lidLRef.current.scale.y, lidTarget, 3, dt);
    }
    if (lidRRef.current) {
      lidRRef.current.scale.y = THREE.MathUtils.damp(lidRRef.current.scale.y, lidTarget, 3, dt);
    }
    if (mouthRef.current) {
      mouthRef.current.scale.x = THREE.MathUtils.damp(
        mouthRef.current.scale.x,
        endingTriggered ? 1.1 : 0.5,
        3,
        dt,
      );
    }
  });

  return (
    <group position={position} rotation={[0, Math.PI * 0.2, 0]}>
      {/* Fairy lamps: visible stakes + soft pink / moon fill on her */}
      <group position={[0, 0, 0]}>
        {(
          [
            [1.15, 0.7, '#ffb8e8'],
            [-1.05, 0.45, '#ffd0f8'],
            [0.2, -1.05, '#ffc8ec'],
          ] as const
        ).map(([x, z, col], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.21, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.032, 0.42, 6]} />
              <meshStandardMaterial color="#3d2a22" roughness={1} />
            </mesh>
            <mesh position={[0, 0.45, 0]}>
              <sphereGeometry args={[0.09, 10, 10]} />
              <meshStandardMaterial
                color={col}
                emissive={col}
                emissiveIntensity={1.1}
                roughness={0.35}
              />
            </mesh>
            <pointLight color={col} intensity={0.95} distance={3.8} decay={2} position={[0, 0.45, 0]} />
          </group>
        ))}
        <pointLight color="#d8e8ff" intensity={0.42} distance={6} decay={2} position={[0, 0.85, 0.15]} />
      </group>

      {/* Small picnic cloth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <circleGeometry args={[1.1, 24]} />
        <meshStandardMaterial color="#e9bfa0" roughness={1} />
      </mesh>

      <PicnicCat />

      <group ref={bodyRef}>
        {/* Torso — sitting/leaning pose */}
        <mesh castShadow position={[0, 0.25, 0]} rotation={[-0.25, 0, 0]}>
          <coneGeometry args={[0.28, 0.55, 12]} />
          <meshStandardMaterial
            color="#d987a6"
            roughness={0.9}
            emissive="#c06090"
            emissiveIntensity={0.22}
          />
        </mesh>
        {/* Legs tucked */}
        <mesh castShadow position={[-0.12, 0.12, 0.35]} rotation={[-1.2, 0.1, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.36, 10]} />
          <meshStandardMaterial color="#ffe2c0" />
        </mesh>
        <mesh castShadow position={[0.12, 0.12, 0.35]} rotation={[-1.2, -0.1, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.36, 10]} />
          <meshStandardMaterial color="#ffe2c0" />
        </mesh>
        {/* Arm resting on lap */}
        <mesh castShadow position={[0, 0.25, 0.2]} rotation={[-0.9, 0, 0.2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.3, 8]} />
          <meshStandardMaterial color="#ffe2c0" />
        </mesh>

        {/* Head group */}
        <group ref={headRef} position={[0, 0.62, 0.08]} rotation={[0.05, 0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.26, 18, 16]} />
            <meshStandardMaterial color="#fff0d8" roughness={0.85} />
          </mesh>
          {/* Short hair cap */}
          <mesh position={[0, 0.07, -0.02]} castShadow>
            <sphereGeometry args={[0.28, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color="#caa05a" roughness={0.9} />
          </mesh>
          {/* Side bangs */}
          <mesh position={[-0.18, 0.07, 0.1]} castShadow>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color="#caa05a" roughness={0.9} />
          </mesh>
          <mesh position={[0.18, 0.07, 0.1]} castShadow>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color="#caa05a" roughness={0.9} />
          </mesh>
          {/* Ears — longer pointy elf */}
          <mesh position={[-0.26, -0.02, -0.02]} rotation={[0, 0, -0.5]}>
            <coneGeometry args={[0.07, 0.22, 8]} />
            <meshStandardMaterial color="#fff0d8" />
          </mesh>
          <mesh position={[0.26, -0.02, -0.02]} rotation={[0, 0, 0.5]}>
            <coneGeometry args={[0.07, 0.22, 8]} />
            <meshStandardMaterial color="#fff0d8" />
          </mesh>
          {/* Glasses — two rings + bridge */}
          <mesh position={[-0.1, 0, 0.23]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.06, 0.012, 8, 16]} />
            <meshStandardMaterial color="#2a1d15" />
          </mesh>
          <mesh position={[0.1, 0, 0.23]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.06, 0.012, 8, 16]} />
            <meshStandardMaterial color="#2a1d15" />
          </mesh>
          <mesh position={[0, 0, 0.23]}>
            <boxGeometry args={[0.08, 0.01, 0.01]} />
            <meshStandardMaterial color="#2a1d15" />
          </mesh>
          {/* Eye shine highlights — visible as little sparkles even through closed lids */}
          <mesh position={[-0.086, 0.018, 0.248]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0.114, 0.018, 0.248]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.2} />
          </mesh>
          {/* Eyelids (closed = sleeping); shrink when awake */}
          <mesh ref={lidLRef} position={[-0.1, -0.005, 0.245]}>
            <boxGeometry args={[0.09, 0.02, 0.005]} />
            <meshStandardMaterial color="#5a3a24" />
          </mesh>
          <mesh ref={lidRRef} position={[0.1, -0.005, 0.245]}>
            <boxGeometry args={[0.09, 0.02, 0.005]} />
            <meshStandardMaterial color="#5a3a24" />
          </mesh>
          {/* Mouth */}
          <mesh ref={mouthRef} position={[0, -0.1, 0.245]} scale={[0.5, 1, 1]}>
            <boxGeometry args={[0.07, 0.012, 0.005]} />
            <meshStandardMaterial color="#7a3b3b" />
          </mesh>
          {/* Blush */}
          <mesh position={[-0.15, -0.05, 0.22]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#f49aa8" transparent opacity={0.55} />
          </mesh>
          <mesh position={[0.15, -0.05, 0.22]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#f49aa8" transparent opacity={0.55} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
