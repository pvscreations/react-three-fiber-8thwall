/**
 * Shared smoke-test scene: spinning clickable box (red ↔ green).
 * Works under both `<Threejs>` and `<EighthWall>` because it is plain R3F.
 */
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

export default function TestExperience() {
  const [color, setColor] = useState<"red" | "green">("red");
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t;
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0.5, -8]}
      onClick={(e) => {
        e.stopPropagation();
        setColor((c) => (c === "red" ? "green" : "red"));
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}
