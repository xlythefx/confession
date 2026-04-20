import { useMemo } from 'react';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

/** Procedural albedo: reads like grass from above, tiles on the ground plane. */
function createGrassGroundTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const base = ctx.createLinearGradient(0, 0, size, size);
  base.addColorStop(0, '#4d6b38');
  base.addColorStop(0.5, '#5c7d42');
  base.addColorStop(1, '#4a6334');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Short strokes + specks (cheap “grass blades” in the texture, not geometry).
  for (let i = 0; i < 5200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const h = 2 + Math.random() * 10;
    const w = 0.8 + Math.random() * 1.8;
    ctx.fillStyle = Math.random() > 0.55 ? '#7a9a52' : '#3d522c';
    ctx.globalAlpha = 0.12 + Math.random() * 0.35;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 0.9);
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  for (let i = 0; i < 900; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = Math.random() > 0.5 ? '#a4c070' : '#2f3f24';
    ctx.globalAlpha = 0.04 + Math.random() * 0.12;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

// Ground plane + night sky dome + moon. GrassChunks adds 3D blades near the player.
export default function World() {
  const grassGroundTexture = useMemo(() => {
    const tex = createGrassGroundTexture();
    tex.repeat.set(56, 56);
    return tex;
  }, []);

  const skyTexture = useMemo(() => {
    // Vertical gradient canvas used as a background sphere material.
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0.0, '#0a1428'); // deep night zenith
    grad.addColorStop(0.35, '#152238');
    grad.addColorStop(0.62, '#243a52');
    grad.addColorStop(0.88, '#3a5570');
    grad.addColorStop(1.0, '#4a6a82'); // misty horizon (meets fog)
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <>
      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[60, 24, 16]} />
        <meshBasicMaterial map={skyTexture} side={THREE.BackSide} fog={false} depthWrite={false} />
      </mesh>

      {/* Moon: billboard so the disc always faces the camera; high + far reads as sky */}
      <Billboard position={[0, 21, -52]} follow>
        <group renderOrder={5}>
          <mesh>
            <circleGeometry args={[5.5, 56]} />
            <meshBasicMaterial
              color="#6a8fd8"
              transparent
              opacity={0.28}
              fog={false}
              depthWrite={false}
            />
          </mesh>
          <mesh>
            <circleGeometry args={[2.35, 48]} />
            <meshBasicMaterial color="#eef6ff" transparent opacity={1} fog={false} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[1.75, 40]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.65} fog={false} depthWrite={false} />
          </mesh>
        </group>
      </Billboard>

      {/* Ground — tiled grass + cool moonlit tint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          map={grassGroundTexture}
          color="#9fb4c4"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Slightly brighter turf near origin under moon wash */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[42, 48]} />
        <meshStandardMaterial
          color="#5a7a68"
          roughness={1}
          transparent
          opacity={0.28}
        />
      </mesh>
    </>
  );
}
