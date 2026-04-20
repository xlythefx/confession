import { forwardRef, useRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerController } from '../../hooks/usePlayerController';
import { useGameState } from '../../hooks/useGameState';
import { FLOWER_POS, PRINCESS_POS } from './Scene';

const WALK_SPEED = 1.6;
const RUN_MULT = 1.8;
const TURN_SMOOTH = 8;

/** Body-local: floating torch at side; flower ~20% lower than prior chest hold */
const TORCH_SIDE = new THREE.Vector3(0.3, 0.56, 0.055);
const FLOWER_HOLD = new THREE.Vector3(-0.2, 0.816, 0.12);

/** Held bloom — stem hangs from grip point. */
function HeldFlower() {
  return (
    <group rotation={[-0.45, 0.35, -0.2]}>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.22, 6]} />
        <meshStandardMaterial color="#5a7a3a" roughness={0.9} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.065, 0.04, Math.sin(a) * 0.065]} rotation={[0, -a, 0.85]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial
              color="#ffd0ea"
              emissive="#ff7eb8"
              emissiveIntensity={0.55}
              roughness={0.55}
            />
          </mesh>
        );
      })}
      <mesh position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshStandardMaterial color="#fff6d8" emissive="#ffe0a0" emissiveIntensity={1.1} roughness={0.45} />
      </mesh>
      <pointLight color="#ffc4e8" intensity={0.55} distance={2.2} decay={2} position={[0, 0.06, 0]} />
    </group>
  );
}

const Player = forwardRef<THREE.Group>((_, ref) => {
  const groupRef = useRef<THREE.Group>(null!);
  useImperativeHandle(ref, () => groupRef.current);
  const input = usePlayerController();
  const hasFlower = useGameState((s) => s.hasFlower);

  const bodyRef = useRef<THREE.Group>(null!);
  const lampRef = useRef<THREE.PointLight>(null!);
  const torchMountRef = useRef<THREE.Group>(null!);
  const flowerRef = useRef<THREE.Group>(null!);
  const flickerT = useRef(0);

  const velocity = useRef(new THREE.Vector3());
  const targetYaw = useRef(0);
  const walkPhase = useRef(0);

  const state = useGameState;

  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g) return;

    flickerT.current += dt;

    const {
      gameStarted,
      interactionLocked,
      endingTriggered,
      hasFlower: hf,
      nearFlower,
      nearPrincess,
      pickupFlower,
      lockInteraction,
      triggerEnding,
    } = state.getState();

    if (input.current.interact && !input.current.interactConsumed) {
      input.current.interactConsumed = true;
      if (!interactionLocked && gameStarted) {
        if (nearFlower && !hf) {
          pickupFlower();
        } else if (nearPrincess && hf && !endingTriggered) {
          const dx = PRINCESS_POS.x - g.position.x;
          const dz = PRINCESS_POS.z - g.position.z;
          targetYaw.current = Math.atan2(dx, dz);
          lockInteraction(true);
          setTimeout(() => triggerEnding(), 400);
        }
      }
    }

    const canMove = gameStarted && !interactionLocked;
    const fwd = (input.current.forward ? 1 : 0) - (input.current.back ? 1 : 0);
    const str = (input.current.right ? 1 : 0) - (input.current.left ? 1 : 0);

    const move = new THREE.Vector3(str, 0, -fwd);
    const moving = canMove && move.lengthSq() > 0.0001;

    if (moving) {
      move.normalize();
      const speed = WALK_SPEED * (input.current.run ? RUN_MULT : 1);
      velocity.current.lerp(move.multiplyScalar(speed), 0.25);
      targetYaw.current = Math.atan2(move.x, move.z);
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.2);
    }

    g.position.addScaledVector(velocity.current, dt);
    g.position.y = 0;

    const maxR = 22;
    if (g.position.length() > maxR) {
      g.position.setLength(maxR);
    }

    const dy =
      THREE.MathUtils.euclideanModulo(targetYaw.current - g.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
    g.rotation.y += dy * Math.min(1, dt * TURN_SMOOTH);

    const speedMag = velocity.current.length();
    walkPhase.current += dt * (speedMag * 3 + 1.5);
    const bob = moving ? Math.sin(walkPhase.current * 2) * 0.04 : Math.sin(walkPhase.current * 0.8) * 0.015;
    const sway = moving ? Math.sin(walkPhase.current) * 0.08 : 0;
    if (bodyRef.current) {
      bodyRef.current.position.y = 0.5 + bob;
      bodyRef.current.rotation.z = sway * 0.15;
    }

    const torch = torchMountRef.current;
    if (torch) {
      torch.position.lerp(TORCH_SIDE, 1 - Math.exp(-11 * dt));
      torch.rotation.x = THREE.MathUtils.damp(torch.rotation.x, -0.22, 9, dt);
      torch.rotation.z = THREE.MathUtils.damp(torch.rotation.z, moving ? sway * 0.12 : 0, 6, dt);
    }

    if (flowerRef.current && hf) {
      const wobble = Math.sin(walkPhase.current * 1.5) * 0.028;
      flowerRef.current.position.set(FLOWER_HOLD.x, FLOWER_HOLD.y + wobble, FLOWER_HOLD.z);
      flowerRef.current.rotation.z = THREE.MathUtils.damp(
        flowerRef.current.rotation.z,
        moving ? sway * 0.1 : 0,
        5,
        dt,
      );
    }

    if (lampRef.current) {
      const base = 2.15;
      const flick =
        Math.sin(flickerT.current * 12.4) * 0.28 +
        Math.sin(flickerT.current * 21.1) * 0.14 +
        (Math.random() - 0.5) * 0.12;
      const target = endingTriggered ? 3.4 : base + flick;
      lampRef.current.intensity = THREE.MathUtils.damp(lampRef.current.intensity, target, 6, dt);
    }

    void FLOWER_POS;
  });

  return (
    <group ref={groupRef} position={[0, 0, 10]}>
      <group ref={bodyRef}>
        {/* Body / tunic */}
        <mesh castShadow position={[0, 0.38, 0]}>
          <coneGeometry args={[0.28, 0.7, 12]} />
          <meshStandardMaterial color="#6ea36e" roughness={0.9} />
        </mesh>
        {/* Belt */}
        <mesh position={[0, 0.18, 0]}>
          <torusGeometry args={[0.22, 0.035, 8, 16]} />
          <meshStandardMaterial color="#7a4a2a" roughness={0.8} />
        </mesh>
        {/* Legs */}
        <mesh castShadow position={[-0.09, 0.05, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.22, 8]} />
          <meshStandardMaterial color="#3b2a1e" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0.09, 0.05, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.22, 8]} />
          <meshStandardMaterial color="#3b2a1e" roughness={0.9} />
        </mesh>
        {/* Head */}
        <mesh castShadow position={[0, 0.88, 0]}>
          <sphereGeometry args={[0.26, 18, 16]} />
          <meshStandardMaterial color="#ffe2c0" roughness={0.85} />
        </mesh>
        {/* Curly hair — cluster of small spheres */}
        <group position={[0, 1.04, 0]}>
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const r = 0.23 + ((i * 7) % 5) * 0.012;
            const y = 0.02 + Math.sin(i * 1.7) * 0.07;
            return (
              <mesh key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]} castShadow>
                <sphereGeometry args={[0.09 + ((i * 3) % 4) * 0.01, 10, 8]} />
                <meshStandardMaterial color="#6b3b22" roughness={0.9} />
              </mesh>
            );
          })}
          <mesh position={[0, 0.08, 0]} castShadow>
            <sphereGeometry args={[0.13, 12, 10]} />
            <meshStandardMaterial color="#6b3b22" roughness={0.9} />
          </mesh>
        </group>
        {/* Ears — pointy elf */}
        <mesh position={[-0.26, 0.88, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.06, 0.16, 8]} />
          <meshStandardMaterial color="#ffe2c0" roughness={0.85} />
        </mesh>
        <mesh position={[0.26, 0.88, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.06, 0.16, 8]} />
          <meshStandardMaterial color="#ffe2c0" roughness={0.85} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.09, 0.88, 0.23]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#1c1410" />
        </mesh>
        <mesh position={[0.09, 0.88, 0.23]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#1c1410" />
        </mesh>

        {/* Floating torch — compact scale, stays at side even with flower */}
        <group ref={torchMountRef} position={[0.3, 0.56, 0.055]} rotation={[-0.22, 0, 0]}>
          <group rotation={[0.18, 0, 0]} scale={0.62}>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.038, 0.042, 0.36, 8]} />
              <meshStandardMaterial color="#5c3d28" roughness={0.95} />
            </mesh>
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.045, 0.046, 0.08, 8]} />
              <meshStandardMaterial color="#3a2418" roughness={0.88} />
            </mesh>
            <mesh position={[0, -0.02, 0]}>
              <cylinderGeometry args={[0.048, 0.048, 0.045, 8]} />
              <meshStandardMaterial color="#6a6e76" metalness={0.65} roughness={0.42} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.072, 0.056, 0.11, 10]} />
              <meshStandardMaterial color="#555a62" metalness={0.55} roughness={0.45} />
            </mesh>
            <mesh position={[0, 0.24, 0]}>
              <coneGeometry args={[0.095, 0.22, 6]} />
              <meshStandardMaterial
                color="#ff7a2e"
                emissive="#ff5200"
                emissiveIntensity={2.4}
                transparent
                opacity={0.82}
                depthWrite={false}
              />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <coneGeometry args={[0.048, 0.16, 5]} />
              <meshStandardMaterial color="#fff2c8" emissive="#ffdd88" emissiveIntensity={3.2} />
            </mesh>
            <pointLight
              ref={lampRef}
              color="#ffcba6"
              intensity={2.15}
              distance={4.6}
              decay={2}
              position={[0, 0.2, 0]}
            />
          </group>
        </group>

        {/* Floating flower — slightly lower than before */}
        {hasFlower ? (
          <group ref={flowerRef} position={[-0.2, 0.816, 0.12]}>
            <HeldFlower />
          </group>
        ) : null}
      </group>
    </group>
  );
});

Player.displayName = 'Player';
export default Player;
