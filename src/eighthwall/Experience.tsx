/**
 * Minimal AR smoke-test scene: a clickable box that toggles red ↔ green.
 * Swap this out via `<EighthWall>{yourScene}</EighthWall>` — keep XR glue untouched.
 */
import { useState } from "react";

export default function Experience() {
  const [color, setColor] = useState<"red" | "green">("red");

  return (
    <mesh
      position={[0, 0.5, -2]}
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
