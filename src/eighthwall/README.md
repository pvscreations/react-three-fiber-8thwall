# `eighthwall`

Web AR host: mounts **React Three Fiber** on top of the **8th Wall (XR8)** camera pipeline.

Use this when you need real-world tracking (SLAM), camera background, and R3F scenes in AR. For desktop-only 3D, use [`../threejs`](../threejs/README.md) instead.

## Usage

```tsx
import EighthWall from "./eighthwall/EighthWall";
import TestExperience from "./threejs/components/TestExperience";

export default function App() {
  return (
    <EighthWall>
      <TestExperience />
    </EighthWall>
  );
}
```

Same children contract as `<Threejs>` — swap scene content without touching XR bootstrap.

## Prerequisites

- `index.html` loads XR8 / XRExtras / LandingPage scripts and provides `<canvas class="r3f">`.
- HTTPS (or localhost) so the camera permission flow works.
- Device with AR-capable browser when testing on hardware.

## Layout

```
eighthwall/
  EighthWall.tsx          React entry — waits for xrloaded, starts XR, pushes children to R3F root
  setup.ts                window.THREE + R3F extend(THREE)
  index.css               canvas touch / pointer rules for AR
  README.md
  components/
    Experience.tsx        minimal clickable-box smoke test
  pipeline/
    initializeXR.ts       XR8.addCameraPipelineModules + XR8.run
    createR3FModule.ts    bridges XR8 Three.js runtime ↔ R3F createRoot
  utils/
    camera.ts             NDC, projection inverse, syncProjection
    renderer.ts           resize guard (R3F configure vs XR8 resize)
    canvas.ts             CSS box size helper
  types/
    globals.d.ts          ambient XR8 / LandingPage / XRExtras / window.THREE
```

## How it works (short)

1. `EighthWall` listens for `xrloaded` (or uses `window.XR8` if already present).
2. `initializeXR` calls `XR8.XrController.configure({ disableWorldTracking: false, scale: "responsive" })`, then registers pipeline modules and `XR8.run({ canvas })`.
3. `createR3FModule.onStart` reuses `XR8.Threejs.xrScene()` and mounts an R3F root with `frameloop: "never"`.
4. Each XR8 frame calls `advance()` so `useFrame` and R3F subscriptions keep running.
5. Custom event `compute` keeps picking accurate under XR camera / canvas sizing quirks.

## Pipeline modules (what each does)

| Module | Role |
| --- | --- |
| `XR8.GlTextureRenderer` | Draws the camera feed |
| `XR8.Threejs` | Creates the shared Three.js AR scene |
| `XR8.XrController` | SLAM / world tracking |
| `LandingPage` | Desktop / non-AR entry — prompts to open on a supported mobile device |
| `XRExtras.AlmostThere` | Unsupported browser / device hints |
| `XRExtras.FullWindowCanvas` | Canvas fills the window |
| `XRExtras.Loading` | Startup loading screen |
| `XRExtras.RuntimeError` | Runtime error UI |
| `createR3FModule` | Custom — mounts R3F on XR8's Three.js runtime |

## Do / don't

| Do | Don't |
| --- | --- |
| Pass R3F trees as `children` | Create a second `<Canvas>` / WebGLRenderer inside EighthWall |
| Let XR8 own the camera pose | Drive `camera.position` every frame with a desktop Rig |
| Keep scene demos in `components/` or shared folders | Put XR pipeline logic inside Experience files |

## Related

- Root overview: [`Developer.md`](../../Developer.md)
- Desktop host: [`../threejs/README.md`](../threejs/README.md)
- DOM UI: [`../dom/README.md`](../dom/README.md)
