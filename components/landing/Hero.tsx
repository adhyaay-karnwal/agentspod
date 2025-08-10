"use client";
import { motion } from "framer-motion";
import Lottie from "react-lottie-player";
import sampleLottieData from "./wind-lottie.json";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef(null);

  return (
    <section className="relative flex flex-col justify-center items-center w-full min-h-[80vh] pt-16 pb-20 overflow-hidden bg-white">
      {/* Subtle Cloud SVG background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <svg width="100%" height="100%" viewBox="0 0 1440 450" fill="none" className="absolute top-0 left-0">
          <defs>
            <linearGradient id="cloud-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#e0f2fe" stopOpacity="0.6" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <ellipse cx="500" cy="180" rx="350" ry="70" fill="url(#cloud-gradient)" />
          <ellipse cx="1100" cy="240" rx="320" ry="90" fill="url(#cloud-gradient)" />
          <ellipse cx="800" cy="350" rx="400" ry="100" fill="url(#cloud-gradient)" />
        </svg>
      </div>
      <div className="relative z-10 w-full flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-center mb-6 leading-tight"
        >
          Welcome to{" "}
          <span className="bg-gradient-to-tr from-sky-400 to-blue-600 text-transparent bg-clip-text">
            Wind
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="text-xl md:text-2xl text-gray-700 text-center mb-10 max-w-2xl"
        >
          The futuristic platform for seamless, AI-powered cloud workflows.
        </motion.p>
        <motion.a
          href="#waitlist"
          whileHover={{
            scale: 1.07,
            boxShadow: "0 4px 28px 0 rgba(56,191,248,0.30)",
            background:
              "linear-gradient(90deg, #38bdf8 0%, #2563eb 100%)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="inline-block rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 px-8 py-4 text-white text-lg font-semibold shadow-lg hover:shadow-xl focus:outline-none mb-8"
        >
          Join the Waitlist
        </motion.a>
        {/* Lottie Animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="w-[280px] md:w-[340px] mt-2"
        >
          <Lottie
            loop
            animationData={sampleLottieData}
            play
            style={{ width: "100%", height: "auto" }}
          />
        </motion.div>
      </div>
    </section>
  );
}