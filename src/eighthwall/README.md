# `eighthwall`

Mounts **React Three Fiber** on the **8th Wall (XR8)** camera pipeline — one shared WebGLRenderer.

## Usage

```tsx
import EighthWall from "./eighthwall/EighthWall";
import Experience from "./eighthwall/Experience";

export default function App() {
  return (
    <EighthWall>
      <Experience />
    </EighthWall>
  );
}
```

## Prerequisites (`index.html`)

1. XR8 / XRExtras / Landing Page script tags  
2. Canvas with class **`r3f-8thwall`**:

```html
<canvas class="r3f-8thwall"></canvas>
```

`EighthWall` uses selector `canvas.r3f-8thwall` (`CANVAS_SELECTOR`). Rename in HTML **and** in code if you change it.

3. HTTPS (or localhost) for camera access.
4. Canvas CSS in `src/index.css` (`touch-action: none`).

## Layout

```
eighthwall/
  EighthWall.tsx        React host — xrloaded → initializeXR → R3F children
  StopR3FRender.tsx     useFrame(..., 1) — XR8 draws, R3F does not gl.render
  Experience.tsx        sample clickable box
  setup.ts              window.THREE + R3F extend(THREE)
  pipeline/
    initializeXR.ts     standard XR8 modules + R3F bridge last
    createR3FModule.ts  createRoot on XR8 scene; Timer + advance()
  utils/
    camera.ts           NDC / projection inverse / syncProjection
    renderer.ts         resize guard during R3F configure
    canvas.ts           CSS box size for R3F
  types/
    globals.d.ts        XR8 / LandingPage / XRExtras / window.THREE
```

## How it works

1. `EighthWall` waits for `xrloaded` (or uses `window.XR8` if already there).
2. `initializeXR` configures world tracking and registers pipeline modules.
3. `createR3FModule.onStart` reuses `XR8.Threejs.xrScene()` and mounts R3F with `frameloop: "never"`.
4. Each XR8 frame: `Timer.update()` → `advance(timer.getElapsed())` (drives `useFrame`).
5. `StopR3FRender` takes render priority `1` so R3F does not call `gl.render` (avoids white screen over the camera feed).

## Do / don’t

| Do | Don’t |
| --- | --- |
| Pass R3F trees as `children` | Create a second `<Canvas>` / WebGLRenderer inside EighthWall |
| Keep class `r3f-8thwall` on the canvas | Rename the canvas without updating `CANVAS_SELECTOR` |
| Let XR8 own camera pose | Drive `camera.position` every frame in AR |

## Related

- Root README: [`../../README.md`](../../README.md)
- Developer map: [`../../Developer.md`](../../Developer.md)
- CI: [`../../.github/workflows/README.md`](../../.github/workflows/README.md)
