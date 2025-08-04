import { Button } from "@/components/ui/button";
import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useLocation } from "wouter";

export function NotFoundPage() {
  const [_, navigate] = useLocation();

  return (
    <div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center text-white">
        <h1 className="text-7xl font-extrabold mb-6 drop-shadow-lg">404</h1>
        <p className="text-2xl mb-8 font-medium drop-shadow">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Button size={"lg"} onClick={() => navigate("/", { replace: true })}>
          Go Home
        </Button>
      </div>

      <div className="absolute inset-0 z-0">
        <Canvas>
          <Stars radius={50} count={2500} factor={4} fade speed={2} />
        </Canvas>
      </div>
    </div>
  );
}
