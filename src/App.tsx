import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Perf } from "r3f-perf";
import { Experience } from "./experience/Experience";

function App() {
  return (
    <>
      <Canvas>
        <Experience />
        <Perf position="top-left" />
      </Canvas>
      <Leva />
    </>
  );
}

export default App;
