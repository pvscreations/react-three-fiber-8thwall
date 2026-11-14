/**
 * EighthWall — R3F scene host for 8th Wall Web AR.
 *
 * Boots XR8 against `<canvas class="r3f-8thwall">` and mounts children on the
 * imperative R3F root (no second `<Canvas>` / WebGLRenderer).
 *
 * Prerequisites in `index.html`:
 * - 8th Wall / XRExtras / Landing Page script tags
 * - `<canvas class="r3f-8thwall"></canvas>`
 */
import { useEffect, useRef, type ReactNode } from "react";
import "./setup";
import type { R3FRoot } from "./pipeline/createR3FModule";
import { initializeXR } from "./pipeline/initializeXR";
import { StopR3FRender } from "./StopR3FRender";

/** CSS selector for the XR canvas — must match `index.html`. */
export const CANVAS_SELECTOR = "canvas.r3f-8thwall";

type EighthWallProps = {
  /** R3F scene graph — same contract as `<Canvas>{children}</Canvas>`. */
  children?: ReactNode;
};

export function EighthWall({ children }: EighthWallProps) {
  // Latch only after initializeXR runs (StrictMode remounts must not skip boot).
  const started = useRef(false);
  const rootRef = useRef<R3FRoot | null>(null);

  // Live ref so pipeline onStart always sees latest children (updated in effect).
  const childrenRef = useRef(children);

  useEffect(() => {
    const canvas = document.querySelector(
      CANVAS_SELECTOR,
    ) as HTMLCanvasElement | null;
    if (!canvas) {
      console.error(
        `[EighthWall] Missing <canvas class="r3f-8thwall"> in index.html.`,
      );
      return;
    }

    const onXrLoaded = () => {
      if (started.current) return;
      started.current = true;

      initializeXR(canvas, {
        getContent: () => (
          <>
            <StopR3FRender />
            {childrenRef.current}
          </>
        ),
        onRoot: (root) => {
          rootRef.current = root;
        },
      });
    };

    if (window.XR8) onXrLoaded();
    else window.addEventListener("xrloaded", onXrLoaded);

    return () => window.removeEventListener("xrloaded", onXrLoaded);
  }, []);

  useEffect(() => {
    childrenRef.current = children;
    rootRef.current?.render(
      <>
        <StopR3FRender />
        {children}
      </>,
    );
  }, [children]);

  return null;
}

export default EighthWall;
