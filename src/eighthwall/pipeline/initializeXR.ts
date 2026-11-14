/**
 * Wires the XR8 camera pipeline and starts the engine on the given canvas.
 *
 * Pass the `<canvas class="r3f-8thwall">` element from `index.html`.
 *
 * Module order matters: camera texture → Three.js scene → XR controller →
 * device / landing UX extras → our R3F content module last.
 */
import type { ReactNode } from "react";
import { createR3FModule, type R3FRoot } from "./createR3FModule";

export type InitializeXROptions = {
  /** Latest scene content; read at `onStart` (and kept fresh via refs in EighthWall). */
  getContent: () => ReactNode;
  /** Lets EighthWall keep a handle for later `root.render(children)` updates (`null` on detach). */
  onRoot?: (root: R3FRoot | null) => void;
};

export function initializeXR(
  canvas: HTMLCanvasElement,
  { getContent, onRoot }: InitializeXROptions,
) {
  // World tracking + responsive stage scale (matches official 8th Wall samples).
  XR8.XrController.configure({
    disableWorldTracking: false,
    scale: "responsive",
  });

  XR8.addCameraPipelineModules([
    // Draws the camera feed.
    XR8.GlTextureRenderer.pipelineModule(),
    // Creates the shared Three.js AR scene / camera / renderer.
    XR8.Threejs.pipelineModule(),
    // Enables SLAM tracking.
    XR8.XrController.pipelineModule(),
    // Desktop / non-AR entry: prompts to open on a supported mobile device.
    LandingPage.pipelineModule(),
    // Unsupported browser / device hints (XRExtras).
    XRExtras.AlmostThere.pipelineModule(),
    // Modifies the canvas to fill the window.
    XRExtras.FullWindowCanvas.pipelineModule(),
    // Loading screen on startup.
    XRExtras.Loading.pipelineModule(),
    // Error image on runtime error.
    XRExtras.RuntimeError.pipelineModule(),
    // Custom: bridges XR8's Three.js runtime into an R3F root.
    createR3FModule({ canvas, getContent, onRoot }),
  ]);

  // Open the camera and start the camera run loop.
  XR8.run({ canvas });
}
