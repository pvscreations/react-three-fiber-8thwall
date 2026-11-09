import type * as THREE from "three";

/**
 * Mute `setSize` / `setPixelRatio` only while R3F `configure` runs.
 * XR8 (FullWindowCanvas) must still be able to resize the renderer afterward.
 */
export function guardRendererResize(renderer: THREE.WebGLRenderer) {
  const setSize = renderer.setSize.bind(renderer);
  const setPixelRatio = renderer.setPixelRatio.bind(renderer);
  let locked = false;

  renderer.setSize = ((...args: Parameters<THREE.WebGLRenderer["setSize"]>) => {
    if (locked) return;
    return setSize(...args);
  }) as THREE.WebGLRenderer["setSize"];

  renderer.setPixelRatio = ((
    ...args: Parameters<THREE.WebGLRenderer["setPixelRatio"]>
  ) => {
    if (locked) return;
    return setPixelRatio(...args);
  }) as THREE.WebGLRenderer["setPixelRatio"];

  return {
    withoutResize<T>(fn: () => T): T {
      locked = true;
      try {
        return fn();
      } finally {
        locked = false;
      }
    },
  };
}
