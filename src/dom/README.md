# `dom`

Plain **HTML / React DOM** UI module — no WebGL, no XR8.

Use for marketing pages, menus, HUD overlays, or any screen that should stay outside the 3D hosts.

## Usage

```tsx
import Dom from "./dom/Dom";

export default function App() {
  return <Dom />;
}
```

Or compose beside a 3D host (e.g. HTML overlay + canvas already in `index.html`).

## Layout

```
dom/
  Dom.tsx       React DOM entry (placeholder Hello World)
  README.md
```

## Notes

- Keep DOM styling / layout here; keep 3D scene graphs in `threejs` or `eighthwall` children.
- If you need HTML *inside* the 3D scene, prefer `@react-three/drei` `Html` in an R3F component instead of this module.

## Related

- Root overview: [`Developer.md`](../../Developer.md)
- Desktop 3D: [`../threejs/README.md`](../threejs/README.md)
- Web AR: [`../eighthwall/README.md`](../eighthwall/README.md)
