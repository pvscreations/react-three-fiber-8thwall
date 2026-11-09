/**
 * EighthWall — R3F scene host for 8th Wall Web AR.
 *
 * Mirrors `Threejs` (children-as-scene API), but boots XR8 against the
 * existing `<canvas class="r3f">` in index.html instead of creating a Canvas.
 *
 * Renders nothing to the React DOM tree; scene content is mounted onto the
 * imperative R3F root created inside the XR8 pipeline module.
 */
import { useEffect, useRef, type ReactNode } from "react";
import "./index.css";
import "./setup";
import type { R3FRoot } from "./pipeline/createR3FModule";
import { initializeXR } from "./pipeline/initializeXR";

type EighthWallProps = {
  /** R3F scene graph — same contract as `<Threejs>{children}</Threejs>`. */
  children?: ReactNode;
};

export function EighthWall({ children }: EighthWallProps) {
  // XR8.run must only fire once (StrictMode remounts effects in dev).
  const started = useRef(false);
  const rootRef = useRef<R3FRoot | null>(null);

  // Keep a live ref so the pipeline `onStart` always renders the latest children
  // even if XR8 finishes loading after a React re-render.
  const childrenRef = useRef(children);
  childrenRef.current = children;

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const canvas = document.querySelector("canvas.r3f") as HTMLCanvasElement;
    if (!canvas) return;

    const onXrLoaded = () =>
      initializeXR(canvas, {
        getContent: () => childrenRef.current,
        onRoot: (root) => {
          rootRef.current = root;
        },
      });

    // Engine scripts in index.html are async — may already be ready, or not.
    if (window.XR8) onXrLoaded();
    else window.addEventListener("xrloaded", onXrLoaded);

    return () => window.removeEventListener("xrloaded", onXrLoaded);
  }, []);

  // Push React children updates into the imperative R3F root (Canvas-like).
  useEffect(() => {
    rootRef.current?.render(children ?? null);
  }, [children]);

  return null;
}

export default EighthWall;
