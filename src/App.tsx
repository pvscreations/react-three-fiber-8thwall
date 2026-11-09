/**
 * App entry switchboard.
 *
 * Flip between hosts by commenting:
 * - `<EighthWall>` → Web AR via 8th Wall + R3F
 * - `<Threejs>`    → desktop R3F Canvas
 * - `<Dom>`        → plain HTML (import from ./dom/Dom)
 *
 * Scene content is interchangeable — pass any R3F tree as children.
 */
import EighthWall from "./eighthwall/EighthWall";
import TestExperience from "./threejs/components/TestExperience";

// import { Threejs } from "./threejs/Threejs";
// import Experience from "./threejs/components/Experience";

export default function App() {
  return (
    // <Threejs>
    //   <Experience />
    // </Threejs>
    <EighthWall>
      <TestExperience />
    </EighthWall>
  );
}
