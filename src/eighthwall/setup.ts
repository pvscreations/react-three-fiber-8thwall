/**
 * One-time Three.js / R3F bootstrap required by 8th Wall.
 *
 * - `window.THREE`: XR8's Threejs pipeline looks for a global THREE.
 * - `extend(THREE)`: registers Three constructors so R3F JSX (`<mesh>`, etc.) works.
 */
import { extend } from "@react-three/fiber";
import * as THREE from "three";

window.THREE = { ...THREE };
extend(THREE as never);
