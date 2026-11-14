# react-three-fiber-8thwall

**Starter** for Web AR: run [React Three Fiber](https://github.com/pmndrs/react-three-fiber) and [8th Wall](https://www.8thwall.com/) **together** — **one canvas, one WebGLRenderer, one render path**.

**Demo:** [react-three-fiber-8thwall.vercel.app](https://react-three-fiber-8thwall.vercel.app/)  
**npm:** [react-three-fiber-8thwall](https://www.npmjs.com/package/react-three-fiber-8thwall)

### Design points

- **One canvas, one `WebGLRenderer`** — R3F reuses XR8’s `gl`, `scene`, and `camera`. No nested `<Canvas>`, no second renderer.
- **One draw path** — XR8.Threejs renders the camera feed + scene. `StopR3FRender` stops R3F from also calling `gl.render`.
- **XR8 drives the frame** — R3F `frameloop: "never"`; on each XR8 `onUpdate` we `advance()` so `useFrame` runs on XR8’s tick.
- **Resize without fighting XR8** — during R3F `configure`, `setSize` / `setPixelRatio` are muted so XR8 (e.g. FullWindowCanvas) keeps control. On XR8 `onCanvasSizeChange` we pass the canvas CSS box into R3F (helps picking stay aligned).

## Run the starter

```bash
git clone https://github.com/nagendra-dharmireddi/react-three-fiber-8thwall.git
cd react-three-fiber-8thwall
npm install
npm run dev
```

Open the **HTTPS** Network URL on your phone (camera needs a secure context). Local SSL comes from `@vitejs/plugin-basic-ssl`.

## What you edit

```tsx
// src/App.tsx
import EighthWall from "./eighthwall/EighthWall";
import Experience from "./eighthwall/Experience";

export default function App() {
  return (
    <EighthWall>
      <Experience />   {/* ← put your R3F scene here */}
    </EighthWall>
  );
}
```

Swap `Experience` for any plain R3F tree (`<mesh>`, `useFrame`, etc.).

**Non-AR** (no 8th Wall) — same scene under a normal Canvas:

```tsx
import { Canvas } from "@react-three/fiber";

<Canvas>
  <Experience />
</Canvas>
```

## Required `index.html` pieces

Already set up in this starter. Keep them if you copy files elsewhere:

1. **8th Wall CDNs** — engine, xrextras, landing-page scripts  
2. **AR canvas** with class `r3f-8thwall`:

```html
<canvas class="r3f-8thwall"></canvas>
```

`<EighthWall>` queries `canvas.r3f-8thwall`. Wrong class → AR never starts.

## How it works

| Piece | Role |
| --- | --- |
| `EighthWall` | Boots XR8, mounts your R3F children on the shared scene |
| `StopR3FRender` | `useFrame(..., 1)` so R3F does **not** call `gl.render` (XR8 draws) |
| `createR3FModule` | Shared XR8 `gl` / scene / camera; `frameloop: "never"`; XR8 `onUpdate` → `advance()`; resize guard + CSS size on canvas change |
| `initializeXR` | Standard 8th Wall pipeline modules; R3F bridge last |

**XR8 drives render + frame tick. R3F children own the scene graph.**

## Common mistakes

1. Missing 8th Wall script tags in `index.html`
2. Missing or misnamed canvas — must be `class="r3f-8thwall"`
3. Missing canvas CSS (`touch-action: none` in `src/index.css`)
4. Nesting a second R3F `<Canvas>` / second renderer inside `EighthWall`
5. Letting R3F also `gl.render` — fights XR8’s draw (often a white screen)
6. Letting R3F `setSize` run against XR8 during configure — can desync buffer vs layout
7. Overwriting `camera.position` every frame in AR — let XR8 own SLAM pose
8. Testing over plain HTTP — use the HTTPS URL from `npm run dev`

## Project layout

```
src/
  App.tsx                 starter entry
  index.css               canvas.r3f-8thwall touch rules
  eighthwall/
    EighthWall.tsx        AR host
    StopR3FRender.tsx     disables R3F gl.render
    Experience.tsx        sample scene — replace this
    setup.ts              window.THREE + extend(THREE)
    pipeline/             initializeXR + createR3FModule
    utils/                picking / resize helpers
index.html                8th Wall scripts + <canvas class="r3f-8thwall">
```

More detail: [`src/eighthwall/README.md`](src/eighthwall/README.md) · [`Developer.md`](Developer.md) · [CI](.github/workflows/README.md)

## License

MIT

---

## Using as an npm package (optional)

This repo is primarily a **starter**. Package: [npmjs.com/package/react-three-fiber-8thwall](https://www.npmjs.com/package/react-three-fiber-8thwall)

```bash
npm install react-three-fiber-8thwall three @react-three/fiber
```

```tsx
import { EighthWall } from "react-three-fiber-8thwall";

<EighthWall>
  <YourScene />
</EighthWall>
```

You still need the 8th Wall CDNs and `<canvas class="r3f-8thwall">` in your own `index.html`. Add the canvas `touch-action: none` CSS yourself (see `src/index.css`).

Push to `main` publishes to npm and deploys the starter to Vercel — see [`.github/workflows/README.md`](.github/workflows/README.md) for secrets.
