import { RefObject, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  CHUNK_GRID_RADIUS,
  TUFT_BLADES_PER_CHUNK,
  generateBladesForChunk,
  worldToChunk,
} from '../../utils/chunkHelpers';

interface Props {
  playerRef: RefObject<THREE.Group>;
}

// Main blades: 90/chunk, tall tufts: 15/chunk; 7×7 chunks = 49 chunks total.
const BLADES_PER_CHUNK = 90;
const CHUNKS = (CHUNK_GRID_RADIUS * 2 + 1) * (CHUNK_GRID_RADIUS * 2 + 1);
const TOTAL_INSTANCES = CHUNKS * BLADES_PER_CHUNK;
const TOTAL_TUFT_INSTANCES = CHUNKS * TUFT_BLADES_PER_CHUNK;

// GLSL injection for wind sway on InstancedMesh. Blades bend at the tip
// proportional to their UV.y (0 = base, 1 = tip). Each blade phase comes
// from its world-space XZ pulled from instanceMatrix column 3.
const WIND_VERT_PATCH = /* glsl */ `
#include <begin_vertex>
  float heightFactor = uv.y;
  vec3 wp = vec3(instanceMatrix[3][0], 0.0, instanceMatrix[3][2]);
  float wave = sin(wp.x * 2.3 + wp.z * 1.9 + uTime * 2.2) * 0.14 * heightFactor;
  transformed.x += wave;
  transformed.z += wave * 0.45;
`;

const TUFT_WIND_VERT_PATCH = /* glsl */ `
#include <begin_vertex>
  float heightFactor = uv.y;
  vec3 wp = vec3(instanceMatrix[3][0], 0.0, instanceMatrix[3][2]);
  float wave = sin(wp.x * 1.8 + wp.z * 2.1 + uTime * 1.6) * 0.18 * heightFactor;
  transformed.x += wave;
  transformed.z += wave * 0.5;
`;

function makeMaterial(vertPatch: string, timeRef: { value: number }) {
  const mat = new THREE.MeshStandardMaterial({
    color: '#c5d8dc',
    roughness: 1,
    flatShading: true,
    vertexColors: true,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = timeRef;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      vertPatch,
    );
  };
  // Mark as needing custom program key so R3F re-compiles for instancing.
  mat.customProgramCacheKey = () => vertPatch;
  return mat;
}

export default function GrassChunks({ playerRef }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const tuftRef = useRef<THREE.InstancedMesh>(null!);
  const lastChunk = useRef<{ cx: number; cz: number }>({ cx: 9999, cz: 9999 });
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  // Shared time uniform — advanced in useFrame, read by both shaders.
  const timeUniform = useMemo(() => ({ value: 0 }), []);

  // Main blade geometry: 5-sided cone with 2 height segments for smooth bend.
  const geometry = useMemo(() => {
    const g = new THREE.ConeGeometry(0.05, 0.52, 5, 2);
    g.translate(0, 0.26, 0);
    return g;
  }, []);

  // Tall tuft geometry: wider and taller for background variety.
  const tuftGeometry = useMemo(() => {
    const g = new THREE.ConeGeometry(0.07, 0.9, 5, 2);
    g.translate(0, 0.45, 0);
    return g;
  }, []);

  const material = useMemo(() => makeMaterial(WIND_VERT_PATCH, timeUniform), [timeUniform]);
  const tuftMaterial = useMemo(() => makeMaterial(TUFT_WIND_VERT_PATCH, timeUniform), [timeUniform]);

  const rebuild = (cx: number, cz: number) => {
    const mesh = meshRef.current;
    const tuft = tuftRef.current;
    if (!mesh || !tuft) return;

    let i = 0;
    let ti = 0;
    for (let dz = -CHUNK_GRID_RADIUS; dz <= CHUNK_GRID_RADIUS; dz++) {
      for (let dx = -CHUNK_GRID_RADIUS; dx <= CHUNK_GRID_RADIUS; dx++) {
        // Main blades
        const blades = generateBladesForChunk(cx + dx, cz + dz, BLADES_PER_CHUNK);
        for (const b of blades) {
          dummy.position.set(b.x, 0, b.z);
          dummy.rotation.set(0, b.rot, 0);
          dummy.scale.set(b.scale, b.scale, b.scale);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          // Frosted / snowy grass: cool green-white, low sat, high lightness.
          color.setHSL(0.22 + b.tint * 0.1, 0.08 + b.tint * 0.18, 0.52 + b.tint * 0.22);
          mesh.setColorAt(i, color);
          i++;
        }

        // Sparse tall tufts — use a secondary deterministic slice of blades.
        const tufts = generateBladesForChunk(cx + dx, cz + dz + 5000, TUFT_BLADES_PER_CHUNK);
        for (const b of tufts) {
          dummy.position.set(b.x, 0, b.z);
          dummy.rotation.set(0, b.rot, 0);
          dummy.scale.set(b.scale, b.scale, b.scale);
          dummy.updateMatrix();
          tuft.setMatrixAt(ti, dummy.matrix);
          // Deeper frosted tufts — still reads green under moonlight.
          color.setHSL(0.26 + b.tint * 0.06, 0.22, 0.32 + b.tint * 0.14);
          tuft.setColorAt(ti, color);
          ti++;
        }
      }
    }

    for (; i < TOTAL_INSTANCES; i++) {
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    for (; ti < TOTAL_TUFT_INSTANCES; ti++) {
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      tuft.setMatrixAt(ti, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    tuft.instanceMatrix.needsUpdate = true;
    if (tuft.instanceColor) tuft.instanceColor.needsUpdate = true;
  };

  useFrame((_, dt) => {
    timeUniform.value += dt;

    const p = playerRef.current;
    if (!p) return;
    const { cx, cz } = worldToChunk(p.position.x, p.position.z);
    if (cx !== lastChunk.current.cx || cz !== lastChunk.current.cz) {
      lastChunk.current = { cx, cz };
      rebuild(cx, cz);
    }
  });

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, TOTAL_INSTANCES]}
        castShadow={false}
        receiveShadow
      />
      <instancedMesh
        ref={tuftRef}
        args={[tuftGeometry, tuftMaterial, TOTAL_TUFT_INSTANCES]}
        castShadow={false}
        receiveShadow
      />
    </>
  );
}
