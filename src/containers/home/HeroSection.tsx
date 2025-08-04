import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import { navigate } from "wouter/use-browser-location";
import { useLocation } from "wouter";

const COLORS_TOP = ["#A8E6CF", "#FFD3B6", "#FFAAA5", "#D4A5A5"];

export interface AuroraHeroProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  children?: React.ReactNode;
  showBetaBadge?: boolean;
}

export const AuroraHero: React.FC<AuroraHeroProps> = ({
  title = "Decentralised Crowdfunding",
  subtitle = "Join a global community funding innovation transparently and securely. Launch your project or support the next big thing.",
  buttonText = "Get Started",
  children,
  showBetaBadge = true,
}) => {
  const color = useMotionValue(COLORS_TOP[0]);

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;

  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;
  const [_,navigate] = useLocation();

  return (
    <motion.section
      style={{
        backgroundImage,
      }}
      className="relative grid min-h-screen place-content-center overflow-hidden bg-gray-950 px-4 py-24 text-gray-200"
    >
      <div className="relative z-10 flex flex-col items-center">
        {showBetaBadge && (
            <span className="mb-4 inline-flex items-center rounded-full bg-gray-700/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-100 shadow-md">
            <svg
              className="mr-2 h-4 w-4 text-indigo-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M16 2L16.2 2.6V21.7L16 21.9L7.2 17.1L16 2ZM16 2L24.8 17.1L16 21.9V2ZM16 23.1L16.1 23.3V29.7L16 30L7.2 18.7L16 23.1ZM16 30V23.1L24.8 18.7L16 30Z" />
            </svg>
            Ethereum Powered
            </span>
        )}
        <h1 className="max-w-3xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-3xl font-medium leading-tight text-transparent sm:text-5xl sm:leading-tight md:text-7xl md:leading-tight">
          {title}
        </h1>
        <p className="my-6 max-w-xl text-center text-base leading-relaxed md:text-lg md:leading-relaxed">
          {subtitle}
        </p>
        {children}
        <motion.button
          style={{
            border,
            boxShadow,
          }}
          whileHover={{
            scale: 1.015,
          }}
          whileTap={{
            scale: 0.985,
          }}
          className="group relative flex w-fit items-center gap-1.5 rounded-full bg-gray-950/10 px-4 py-2 text-gray-50 transition-colors hover:bg-gray-950/50"
          onClick={() => navigate("/campaigns")}>
          {buttonText}
          <FiArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
        </motion.button>
      </div>

      <div className="absolute inset-0 z-0">
        <Canvas>
          <Stars radius={50} count={2500} factor={4} fade speed={2} />
        </Canvas>
      </div>
    </motion.section>
  );
};
