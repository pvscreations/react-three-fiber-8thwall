# react-three-fiber-8thwall

**Starter** for Web AR: run [React Three Fiber](https://github.com/pmndrs/react-three-fiber) on [8th Wall](https://www.8thwall.com/) with **one shared WebGLRenderer** — no second `<Canvas>`, no fighting the SLAM camera.

## Run the starter

```bash
git clone https://github.com/pvscreations/react-three-fiber-8thwall.git
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
| `StopR3FRender` | `useFrame(..., 1)` so R3F does **not** call `gl.render` (XR8 draws the camera + scene) |
| `createR3FModule` | Shares XR8 gl / scene / camera; `frameloop: "never"` + `THREE.Timer` + `advance()` |
| `initializeXR` | Standard 8th Wall pipeline modules; R3F bridge last |

**Hosts own the runtime. Children own the scene.**

## Common mistakes

1. Missing 8th Wall script tags in `index.html`
2. Missing or misnamed canvas — must be `class="r3f-8thwall"`
3. Missing canvas CSS (`touch-action: none` in `src/index.css`)
4. Nesting a second R3F `<Canvas>` inside `EighthWall`
5. White screen — R3F was clearing the camera feed; `StopR3FRender` prevents that (injected by `EighthWall`)
6. Overwriting `camera.position` every frame in AR — let 8th Wall own SLAM pose
7. Testing over plain HTTP — use the HTTPS URL from `npm run dev`

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

This repo is primarily a **starter**. Publishing as a package is optional:

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
