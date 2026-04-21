# Clair de lune

A tiny, cozy 3D web experience built with React + Vite + React Three Fiber + Tailwind.

A chibi elf boy walks through a moonlit meadow, holding a torch. He finds a sleeping elf girl beneath a tree. He picks a flower. He offers it.

> _Maybe I like you a little._

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (default http://localhost:5173).

## Controls

- **WASD** — walk
- **Shift** — hurry (still gentle)
- **E** — pick up / offer flower

## How it plays

1. Press **Start Walking** on the intro.
2. Walk toward the glowing pink flower ahead. Press **E** to pick it up.
3. Keep walking to the tree. A sleeping elf girl is resting under it.
4. When near her, press **E** to offer the flower.
5. The flowers around her bloom, and the ending text fades in.

## Project layout

```
src/
  App.tsx                        app shell + canvas + overlays
  main.tsx                       React entry
  index.css                      tailwind + small animations
  components/
    ui/
      IntroOverlay.tsx           title + start button
      GameHUD.tsx                flower icon + interaction prompts
      EndingOverlay.tsx          "Maybe I like you a little." + restart
    game/
      Scene.tsx                  lighting, fog, layout, proximity checks
      World.tsx                  night sky, ground, moon
      Player.tsx                 chibi elf boy + torch + flower + walk bob
      FollowCamera.tsx           damped third-person camera
      GrassChunks.tsx            instanced grass regenerated per chunk
      Tree.tsx                   stylized low-poly tree
      PrincessElf.tsx            sleeping elf girl with glasses
      FlowerPickup.tsx           floating glowing flower
      BloomFlowers.tsx           flowers that bloom on offering
      Petals.tsx                 drifting petal particles
  hooks/
    useGameState.ts              zustand central state
    usePlayerController.ts       keyboard input refs
  utils/
    chunkHelpers.ts              deterministic chunk hashing + blade gen
```

## Design notes

- **No physics, no skeletal rig.** Characters are groups of primitives; motion comes from `useFrame` sin-bobbing and damped rotations.
- **Grass chunking.** Only the chunks around the player's current chunk are populated in a single `InstancedMesh`. When the player crosses a chunk boundary, the buffer is rebuilt from a deterministic hash (so the world feels consistent if you revisit).
- **Fog + sky dome** hide the world edges and make chunk pop-in invisible.
- **Emotional beat** = emissive ramp, scale tween, lid close→open, and head tilt. No dialogue system needed.

## Audio

Audio is intentionally omitted to keep setup zero-asset. To add it, drop `ogg`/`mp3` files in `public/audio/` and attach `<audio>` elements or `THREE.PositionalAudio` inside `Scene.tsx` — you already have ambient hooks you can wire up (e.g., play a soft chime in `BloomFlowers` when `endingTriggered` flips).

## Performance

- `dpr` capped at 1.5
- Grass uses a single instanced mesh (many blades, one draw)
- One directional shadow with a modest 1024 map
- Primitive geometry everywhere — no imported models
