/**
 * Stops R3F from calling `gl.render`.
 *
 * `useFrame(fn, 1)` — priority > 0 takes over the render-loop.
 * Empty body = run useFrame subscribers, but do not draw.
 * XR8.Threejs already renders the shared scene + camera feed.
 *
 * Without this, R3F and XR8.Threejs both try to render.
 * Injected automatically by `<EighthWall>` — you usually do not mount it yourself.
 */
import { useFrame } from "@react-three/fiber";

export function StopR3FRender() {
  useFrame(() => {
    // Intentionally empty — priority 1 disables R3F's automatic gl.render.
  }, 1);

  return null;
}
