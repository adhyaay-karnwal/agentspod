"use client";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

const orbs = [
  { left: "10%", top: "20%", size: 160, delay: 0 },
  { left: "70%", top: "16%", size: 110, delay: 0.5 },
  { left: "54%", top: "65%", size: 180, delay: 0.8 },
  { left: "21%", top: "74%", size: 120, delay: 0.3 },
  { left: "82%", top: "55%", size: 140, delay: 0.4 },
];

const orbGradient =
  "linear-gradient(135deg, rgba(255,255,255,0.15) 30%, rgba(200,220,255,0.35) 100%)";

const LoadingScreen: React.FC = () => {
  return (
    <div
      className="relative w-screen h-screen flex items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(120deg, #dbeafe 0%, #bae6fd 30%, #a5b4fc 100%)",
      }}
    >
      {/* Animated floating orbs/clouds */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, opacity: 0.7 }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.7, 1, 0.7],
            transition: {
              duration: 4 + orb.delay,
              repeat: Infinity,
              repeatType: "reverse",
              delay: orb.delay,
            },
          }}
          style={{
            position: "absolute",
            left: orb.left,
            top: orb.top,
            width: orb.size,
            height: orb.size,
            background: orbGradient,
            borderRadius: "50%",
            filter: "blur(4px)",
            zIndex: 1,
            pointerEvents: "none",
            boxShadow: "0 20px 50px 0 rgba(180,200,255,0.25)",
          }}
        />
      ))}

      {/* Centered content */}
      <div className="relative flex flex-col items-center z-10">
        {/* Animated Wind logo */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.25, 0.8, 0.4, 1] }}
          className="mb-10"
        >
          {/* Wind logo SVG */}
          <svg
            width={90}
            height={90}
            viewBox="0 0 72 72"
            fill="none"
            aria-label="Wind Logo"
            className="drop-shadow-lg"
          >
            <defs>
              <linearGradient id="wind-main" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <circle
              cx="36"
              cy="36"
              r="34"
              fill="url(#wind-main)"
              opacity="0.13"
            />
            <path
              d="M18 36c6 0 6-8 16-8s10 8 16 8"
              stroke="url(#wind-main)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M24 44c5 0 5-5 12-5s7 5 12 5"
              stroke="url(#wind-main)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
            <circle
              cx="36"
              cy="36"
              r="34"
              stroke="url(#wind-main)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.27"
            />
          </svg>
        </motion.div>
        {/* Text */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="text-2xl md:text-3xl font-semibold text-slate-800 mb-4 text-center drop-shadow"
        >
          Initializing your workspace...
        </motion.h1>
        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="w-[250px] md:w-[320px] h-4 rounded-xl bg-white/40 shadow-inner flex items-center"
        >
          <ProgressBar />
        </motion.div>
      </div>
    </div>
  );
};

function ProgressBar() {
  // Animate progress from 0 to 90% over 2.5s, then pulse at 90-100%
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    let raf: NodeJS.Timeout | number;
    let start = Date.now();
    function step() {
      const elapsed = (Date.now() - start) / 2500;
      if (elapsed < 1) {
        setProgress(Math.min(elapsed * 0.9, 0.9));
        raf = requestAnimationFrame(step);
      } else {
        // Pulse between 90% and 100%
        let dir = 1;
        let pulse = 0;
        const pulseStep = () => {
          pulse += dir * 0.01;
          if (pulse > 0.1) dir = -1;
          if (pulse < 0) dir = 1;
          setProgress(0.9 + pulse);
          raf = requestAnimationFrame(pulseStep);
        };
        pulseStep();
      }
    }
    step();
    return () => cancelAnimationFrame(raf as number);
  }, []);
  return (
    <div className="relative w-full h-full">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-xl"
        style={{
          background:
            "linear-gradient(90deg, #38bdf8 0%, #6366f1 100%)",
          width: `${Math.round(progress * 100)}%`,
        }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.round(progress * 100)}%` }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
      <div className="absolute left-0 top-0 h-full w-full rounded-xl border border-white/70"></div>
    </div>
  );
}

export default LoadingScreen;