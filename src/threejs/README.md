# `threejs`

Desktop **React Three Fiber** host. Thin wrapper around R3F `<Canvas>` for non-AR development and demos.

Use this to iterate on scenes without the 8th Wall camera pipeline. The same R3F children can later be dropped into [`../eighthwall`](../eighthwall/README.md).

## Usage

```tsx
import { Threejs } from "./threejs/Threejs";
import TestExperience from "./threejs/components/TestExperience";

export default function App() {
  return (
    <Threejs>
      <TestExperience />
    </Threejs>
  );
}
```

## Layout

```
threejs/
  Threejs.tsx                 <Canvas>{children}</Canvas> host
  index.css                   full-viewport black canvas shell
  README.md
  components/
    TestExperience.tsx        spinning clickable box (shared smoke test)
    Experience.tsx            larger gift-box / ticket demo scene
    Test.tsx                  Html portal notes / helpers
```

## Notes

- `index.css` locks `html` / `body` / `#root` to a fixed full-screen viewport.
- Scene files under `components/` are plain R3F — no XR8 imports — so they stay portable.
- When moving a scene into AR, avoid camera controllers that overwrite XR8 SLAM every frame (see comments in `Experience.tsx` around `Rig`).

## Related

- Root overview: [`Developer.md`](../../Developer.md)
- AR host: [`../eighthwall/README.md`](../eighthwall/README.md)
- DOM UI: [`../dom/README.md`](../dom/README.md)
