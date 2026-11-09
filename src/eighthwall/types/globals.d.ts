/**
 * Ambient types for scripts injected from index.html (not npm packages):
 * XR8 engine, XRExtras, LandingPage, and the global THREE mirror setup.ts writes.
 */
import type * as THREE from "three";

declare global {
  interface Window {
    THREE: typeof THREE;
    XR8?: typeof XR8;
  }

  const XR8: {
    addCameraPipelineModules: (modules: unknown[]) => void;
    run: (opts: { canvas: HTMLCanvasElement }) => void;
    Threejs: {
      pipelineModule: () => unknown;
      xrScene: () => {
        scene: THREE.Scene;
        camera: THREE.Camera;
        renderer: THREE.WebGLRenderer;
      };
    };
    GlTextureRenderer: { pipelineModule: () => unknown };
    XrController: {
      configure: (opts: {
        disableWorldTracking?: boolean;
        scale?: "absolute" | "responsive" | string;
      }) => void;
      pipelineModule: () => unknown;
      updateCameraProjectionMatrix: (opts: {
        origin: THREE.Vector3;
        facing: THREE.Quaternion;
      }) => void;
    };
  };

  /** Landing experience — e.g. desktop visitors get prompted to open on mobile AR. */
  const LandingPage: { pipelineModule: () => unknown };

  const XRExtras: {
    /** Unsupported browser / device messaging. */
    AlmostThere: { pipelineModule: () => unknown };
    FullWindowCanvas: { pipelineModule: () => unknown };
    Loading: { pipelineModule: () => unknown };
    RuntimeError: { pipelineModule: () => unknown };
  };
}

export {};
