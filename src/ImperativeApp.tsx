/**
 * Legacy XR8 path: imperative Three.js only (no React Three Fiber).
 * Kept as a reference / fallback — prefer `eighthwall/EighthWall` for new work.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";

window.THREE = { ...THREE };

const box = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: "red" }),
);
box.position.set(0, 0.5, -8);

const raycaster = new THREE.Raycaster();
const ambientLight = new THREE.AmbientLight("#ffffff", 1);
const ndc = new THREE.Vector2();

function onPointerDown(
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  camera: THREE.Camera,
) {
  const rect = canvas.getBoundingClientRect();
  ndc.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );

  camera.updateMatrixWorld();
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  raycaster.setFromCamera(ndc, camera);

  const hit = raycaster.intersectObject(box, false)[0];
  if (!hit) return;

  const material = box.material as THREE.MeshBasicMaterial;
  material.color.set(material.color.getHex() === 0xff0000 ? "green" : "red");
}

function initScene(
  canvas: HTMLCanvasElement,
  scene: THREE.Scene,
  camera: THREE.Camera,
) {
  camera.position.set(0, 1.5, 0);
  scene.add(camera);
  scene.add(ambientLight);
  scene.add(box);

  canvas.addEventListener("pointerdown", (event) => {
    onPointerDown(event, canvas, camera);
  });
}

function initializeXR(canvas: HTMLCanvasElement) {
  XR8.addCameraPipelineModules([
    XR8.GlTextureRenderer.pipelineModule(),
    XR8.Threejs.pipelineModule(),
    XR8.XrController.pipelineModule(),
    LandingPage.pipelineModule(),
    XRExtras.FullWindowCanvas.pipelineModule(),
    XRExtras.Loading.pipelineModule(),
    XRExtras.RuntimeError.pipelineModule(),
    {
      name: "imperative-init",
      onStart: () => {
        const { scene, camera } = XR8.Threejs.xrScene();
        initScene(canvas, scene, camera);
        XR8.XrController.updateCameraProjectionMatrix({
          origin: camera.position,
          facing: camera.quaternion,
        });
      },
    },
  ]);

  XR8.run({ canvas });
}

export default function ImperativeApp() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const canvas = document.querySelector("canvas.r3f") as HTMLCanvasElement;
    if (!canvas) return;

    const onXrLoaded = () => initializeXR(canvas);

    if (window.XR8) onXrLoaded();
    else window.addEventListener("xrloaded", onXrLoaded);

    return () => window.removeEventListener("xrloaded", onXrLoaded);
  }, []);

  return null;
}
