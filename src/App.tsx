/**
 * AR starter — R3F + 8th Wall together via `<EighthWall>`.
 *
 * Requires in index.html:
 *   - 8th Wall script tags
 *   - <canvas class="r3f-8thwall"></canvas>
 *
 * Non-AR (plain R3F, no 8th Wall):
 *   import { Canvas } from "@react-three/fiber";
 *   <Canvas><Experience /></Canvas>
 */
import EighthWall from "./eighthwall/EighthWall";
import Experience from "./eighthwall/Experience";

export default function App() {
  return (
    <EighthWall>
      <Experience />
    </EighthWall>
  );
}
