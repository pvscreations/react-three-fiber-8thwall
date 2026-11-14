# Developer guide

How this starter is wired.

## Mental model

```
index.html
  ├─ 8th Wall / XRExtras / Landing Page scripts
  └─ <canvas class="r3f-8thwall">     ← required; EighthWall queries this

App.tsx
  └─ <EighthWall>
        ├─ <StopR3FRender />          ← injected (R3F must not gl.render)
        └─ <Experience />             ← your R3F scene
```

**Hosts own the runtime. Children own the scene.**

## Canvas class

| Where | Value |
| --- | --- |
| `index.html` | `<canvas class="r3f-8thwall">` |
| `EighthWall.CANVAS_SELECTOR` | `"canvas.r3f-8thwall"` |
| `src/index.css` | `canvas.r3f-8thwall { ... }` |

Change all three together if you rename the class.

## Key files

| File | Purpose |
| --- | --- |
| [`index.html`](index.html) | CDNs + `r3f-8thwall` canvas + `#root` |
| [`src/App.tsx`](src/App.tsx) | Entry — wrap scene in `EighthWall` |
| [`src/eighthwall/EighthWall.tsx`](src/eighthwall/EighthWall.tsx) | AR host |
| [`src/eighthwall/StopR3FRender.tsx`](src/eighthwall/StopR3FRender.tsx) | Disable R3F `gl.render` |
| [`src/eighthwall/pipeline/initializeXR.ts`](src/eighthwall/pipeline/initializeXR.ts) | XR8 pipeline (standard module list) |
| [`src/eighthwall/pipeline/createR3FModule.ts`](src/eighthwall/pipeline/createR3FModule.ts) | XR8 ↔ R3F bridge |

## Local development

```bash
npm run dev      # Vite --host + basic-ssl (HTTPS for camera)
npm run build
npm run lint
```

Test AR on a phone on the same LAN using the Network HTTPS URL.

## Non-AR

```tsx
import { Canvas } from "@react-three/fiber";

<Canvas>
  <Experience />
</Canvas>
```

Same R3F children; no XR8 / no `r3f-8thwall` canvas required.

## Docs

- User-facing: [`README.md`](README.md)
- Module detail: [`src/eighthwall/README.md`](src/eighthwall/README.md)
