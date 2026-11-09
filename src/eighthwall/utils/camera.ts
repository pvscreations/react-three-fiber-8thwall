import * as THREE from "three";

/**
 * XR8 writes the projection matrix every frame but often leaves
 * `projectionMatrixInverse` stale — raycasting then misses. Refresh before pick.
 */
export function refreshCameraInverse(camera: THREE.Camera) {
  camera.updateMatrixWorld();
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}

/**
 * Pointer → NDC using the canvas CSS box (not the WebGL drawing buffer size).
 * Needed because XR / FullWindowCanvas can desync buffer size from layout size.
 */
export function pointerToNdc(
  event: PointerEvent | MouseEvent,
  canvas: HTMLCanvasElement,
) {
  const rect = canvas.getBoundingClientRect();
  return new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );
}

/** Push the current Three camera pose into XR8's controller projection. */
export function syncProjection(camera: THREE.Camera) {
  XR8.XrController.updateCameraProjectionMatrix({
    origin: camera.position,
    facing: camera.quaternion,
  });
}
