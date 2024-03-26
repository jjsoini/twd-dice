import { ConvexHullCollider } from "@react-three/rapier";

const vertices = [
  -0.8, -0.8, 0.8, -0.8, 0.8, 0.8, -0.8, -0.8, -0.8, -0.8, 0.8, -0.8, 0.8, -0.8,
  0.8, 0.8, 0.8, 0.8, 0.8, -0.8, -0.8, 0.8, 0.8, -0.8,
].map((n) => n / 12.5);

export function D6Collider() {
  return <ConvexHullCollider args={[vertices]} />;
}
