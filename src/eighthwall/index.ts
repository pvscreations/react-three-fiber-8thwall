/**
 * Public API for `react-three-fiber-8thwall`.
 *
 * Starter users can also import from `./eighthwall` or individual files.
 */

export { EighthWall, CANVAS_SELECTOR } from "./EighthWall";
export { StopR3FRender } from "./StopR3FRender";

export { initializeXR } from "./pipeline/initializeXR";
export type { InitializeXROptions } from "./pipeline/initializeXR";

export { createR3FModule } from "./pipeline/createR3FModule";
export type {
  CreateR3FModuleOptions,
  R3FRoot,
} from "./pipeline/createR3FModule";
