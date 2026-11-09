# Developer guide

Map of this repo’s front-end modules and how to switch between them.

## Modules

| Module | Path | Role |
| --- | --- | --- |
| **eighthwall** | [`src/eighthwall`](src/eighthwall/README.md) | Web AR via 8th Wall + R3F (shared XR8 Three.js runtime) |
| **threejs** | [`src/threejs`](src/threejs/README.md) | Desktop R3F `<Canvas>` host |
| **dom** | [`src/dom`](src/dom/README.md) | Plain React DOM / HTML UI |

Each module has its own `README.md` with usage, layout, and caveats.

## Mental model

```
App.tsx
  ├─ <EighthWall>   → XR8 pipeline → R3F root on <canvas class="r3f">
  │     └─ {children}   any R3F scene
  ├─ <Threejs>      → R3F <Canvas>
  │     └─ {children}   same style of R3F scene
  └─ <Dom>          → HTML only
```

**Hosts own the runtime. Children own the scene.**  
Swap experiences by changing children; swap platforms by changing the host in `App.tsx`.

## Switching hosts

In [`src/App.tsx`](src/App.tsx):

```tsx
// Web AR
<EighthWall>
  <TestExperience />
</EighthWall>

// Desktop R3F
<Threejs>
  <TestExperience />
</Threejs>

// HTML only
<Dom />
```

`TestExperience` is intentionally host-agnostic R3F so you can verify both paths with one scene.

## Entry & assets

| File | Purpose |
| --- | --- |
| [`index.html`](index.html) | XR8 / XRExtras / LandingPage scripts + `<canvas class="r3f">` + `#root` |
| [`src/main.tsx`](src/main.tsx) | React bootstrap → `App` |
| [`src/App.tsx`](src/App.tsx) | Host switchboard |
| [`src/ImperativeApp.tsx`](src/ImperativeApp.tsx) | Legacy imperative Three.js + XR8 path (no R3F) |
| [`src/xrStore.ts`](src/xrStore.ts) | Tiny zustand-style XR status store (tracking / placement) |

## Local development

```bash
npm run dev      # Vite --host (HTTPS via basic-ssl for camera)
npm run build
npm run lint
```

AR testing needs a secure context and a phone/browser that can access the camera. Desktop `<Threejs>` does not.

## Where to put new code

| You are adding… | Put it in… |
| --- | --- |
| A new AR scene / mesh / interaction | R3F component; pass as `<EighthWall>` children (or under `eighthwall/components`) |
| A desktop-only demo | `threejs/components`, render via `<Threejs>` |
| HTML UI / overlay | `dom/` (or DOM siblings in `App`) |
| XR8 pipeline / picking / resize quirks | `eighthwall/pipeline` or `eighthwall/utils` |
| Shared non-UI state | `src/` (e.g. `xrStore.ts`) |

## Docs index

- [`src/eighthwall/README.md`](src/eighthwall/README.md)
- [`src/threejs/README.md`](src/threejs/README.md)
- [`src/dom/README.md`](src/dom/README.md)
