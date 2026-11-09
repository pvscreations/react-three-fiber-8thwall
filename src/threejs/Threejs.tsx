/**
 * Desktop / non-AR R3F host.
 * Drop any R3F scene as children — same usage pattern as `<EighthWall>`.
 */
import { Canvas } from "@react-three/fiber";
import "./index.css";

export const Threejs = ({ children }: { children: React.ReactNode }) => {
  return <Canvas>{children}</Canvas>;
};
