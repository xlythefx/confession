import { useMemo } from 'react';
import { Billboard, Stars } from '@react-three/drei';
import * as THREE from 'three';

/** Procedural albedo: reads like grass from above, tiles on the ground plane. */
function createGrassGroundTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const base = ctx.createLinearGradient(0, 0, size, size);
  base.addColorStop(0, '#5a6d52');
  base.addColorStop(0.5, '#6a7f5e');
  base.addColorStop(1, '#4d5c48');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Short strokes + specks (cheap “grass blades” in the texture, not geometry).
  for (let i = 0; i < 5200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const h = 2 + Math.random() * 10;
    const w = 0.8 + Math.random() * 1.8;
    ctx.fillStyle = Math.random() > 0.55 ? '#8aa078' : '#3d4a36';
    ctx.globalAlpha = 0.1 + Math.random() * 0.28;
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
    ctx.fillStyle = Math.random() > 0.5 ? '#9cb088' : '#2f3828';
    ctx.globalAlpha = 0.04 + Math.random() * 0.1;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Snow dusting — fine white specks over the turf.
  for (let i = 0; i < 4200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = '#eef6ff';
    ctx.globalAlpha = 0.03 + Math.random() * 0.14;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 1.2 + 0.2, 0, Math.PI * 2);
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
    grad.addColorStop(0.0, '#060e1e'); // deep night zenith — darker for star contrast
    grad.addColorStop(0.28, '#0e1c32');
    grad.addColorStop(0.55, '#1a3048');
    grad.addColorStop(0.82, '#2e4b66');
    grad.addColorStop(1.0, '#3d5f7a'); // misty horizon (meets fog)
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <>
      {/* Procedural star field — sits just inside the sky dome; fog={false} keeps them crisp */}
      <Stars
        radius={55}
        depth={22}
        count={2400}
        factor={3.2}
        saturation={0.18}
        fade
        speed={0.4}
      />

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
          color="#c8dce8"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Slightly brighter turf near origin under moon wash */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[42, 48]} />
        <meshStandardMaterial
          color="#8aa898"
          roughness={1}
          transparent
          opacity={0.32}
        />
      </mesh>
    </>
  );
}
