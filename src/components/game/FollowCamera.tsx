import { RefObject, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  targetRef: RefObject<THREE.Group>;
}

// Third-person camera. Sits behind the player with a slight upward tilt,
// damped so every motion feels cozy rather than snappy.
export default function FollowCamera({ targetRef }: Props) {
  const { camera } = useThree();
  const current = useRef(new THREE.Vector3(0, 4, 18));
  const lookAt = useRef(new THREE.Vector3(0, 1, 0));

  useFrame((_, dt) => {
    const t = targetRef.current;
    if (!t) return;

    // Offset is in the player's local back direction (local -Z).
    const back = new THREE.Vector3(0, 0, -1).applyQuaternion(t.quaternion);
    const desired = t.position
      .clone()
      .add(back.multiplyScalar(4.2))
      .add(new THREE.Vector3(0, 2.4, 0));

    current.current.lerp(desired, 1 - Math.pow(0.001, dt));
    camera.position.copy(current.current);

    const desiredLook = t.position.clone().add(new THREE.Vector3(0, 1, 0));
    lookAt.current.lerp(desiredLook, 1 - Math.pow(0.003, dt));
    camera.lookAt(lookAt.current);
  });

  return null;
}
