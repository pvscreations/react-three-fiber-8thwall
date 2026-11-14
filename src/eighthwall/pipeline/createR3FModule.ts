/**
 * XR8 pipeline module that mounts React Three Fiber onto XR8's Three.js runtime.
 *
 * Key constraints vs plain R3F:
 * - Reuse XR8's gl / scene / camera (do not create a second WebGLRenderer).
 * - `frameloop: "never"` — XR8 owns the render loop; we `advance()` in `onUpdate`.
 * - Drive time with `THREE.Timer` (not deprecated `THREE.Clock`).
 * - Block R3F's configure-time setSize so it does not fight XR8 canvas resizing.
 * - Custom event `compute` so picking uses CSS-box NDC + a fresh projection inverse.
 */
import { advance, createRoot, events } from "@react-three/fiber";
import type { ReactNode } from "react";
import { Timer } from "three";
import { getCanvasSize } from "../utils/canvas";
import {
  pointerToNdc,
  refreshCameraInverse,
  syncProjection,
} from "../utils/camera";
import { guardRendererResize } from "../utils/renderer";

export type R3FRoot = ReturnType<typeof createRoot>;

export type CreateR3FModuleOptions = {
  canvas: HTMLCanvasElement;
  getContent: () => ReactNode;
  onRoot?: (root: R3FRoot | null) => void;
};

export function createR3FModule({
  canvas,
  getContent,
  onRoot,
}: CreateR3FModuleOptions) {
  let root: R3FRoot | null = null;
  let baseConfig: Record<string, unknown> | null = null;
  let resizeGuard: ReturnType<typeof guardRendererResize> | null = null;
  const timer = new Timer();

  /** Configure R3F while muting renderer.setSize / setPixelRatio. */
  const configureSafe = async (config: Record<string, unknown>) => {
    if (!root || !resizeGuard) return;
    await resizeGuard.withoutResize(() =>
      root!.configure({ ...config, size: getCanvasSize(canvas) }),
    );
  };

  return {
    name: "r3f-content",

    onStart: async () => {
      const { scene, camera, renderer } = XR8.Threejs.xrScene();

      // Eye-height starting pose; XR controller will overwrite with SLAM each frame.
      camera.position.set(0, 1.5, 0);
      if (!camera.parent) scene.add(camera);
      syncProjection(camera);

      // Tell R3F not to overwrite projection / view matrices — XR8 owns the camera.
      (camera as { manual?: boolean }).manual = true;
      resizeGuard = guardRendererResize(renderer);

      // Defensive XR pick: CSS NDC + refresh projectionMatrixInverse each pointer event.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eventManager = (state: any) => ({
        ...events(state),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        compute: (event: any, state: any) => {
          state.pointer.copy(pointerToNdc(event, canvas));
          refreshCameraInverse(state.camera);
          state.raycaster.setFromCamera(state.pointer, state.camera);
        },
      });

      baseConfig = {
        gl: renderer,
        scene,
        camera,
        frameloop: "never",
        events: eventManager,
      };

      root = createRoot(canvas);
      await configureSafe(baseConfig);
      root.render(getContent());
      onRoot?.(root);
    },

    onCanvasSizeChange: () => {
      if (!root || !baseConfig) return;
      syncProjection(XR8.Threejs.xrScene().camera);
      void configureSafe(baseConfig);
    },

    // Drive R3F useFrame off XR8's frame, timed with THREE.Timer.
    onUpdate: () => {
      timer.update();
      advance(timer.getElapsed());
    },

    onDetach: () => {
      root?.unmount();
      root = null;
      onRoot?.(null);
    },
  };
}
