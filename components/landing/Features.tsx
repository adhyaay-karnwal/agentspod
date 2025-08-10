"use client";
import { motion } from "framer-motion";

const features = [
  {
    icon: (
      <svg width="40" height="40" fill="none">
        <circle cx="20" cy="20" r="19" fill="#f0f9ff" />
        <path d="M13 21l5 5 9-9" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Lightning Fast",
    desc: "Experience next-gen performance and scale with our cloud-native infrastructure.",
  },
  {
    icon: (
      <svg width="40" height="40" fill="none">
        <circle cx="20" cy="20" r="19" fill="#f0f9ff" />
        <path d="M15 27V18a3 3 0 013-3h5a3 3 0 013 3v9M12 27h16" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Seamless Security",
    desc: "Enterprise-grade protection and compliance, always enabled.",
  },
  {
    icon: (
      <svg width="40" height="40" fill="none">
        <circle cx="20" cy="20" r="19" fill="#f0f9ff" />
        <path d="M28 20a8 8 0 11-16 0 8 8 0 0116 0z" stroke="#38bdf8" strokeWidth="3" />
        <path d="M20 16v4l3 3" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "AI-Powered Automation",
    desc: "Let Wind handle the busywork—focus on what matters most.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Why choose <span className="bg-gradient-to-tr from-sky-400 to-blue-600 bg-clip-text text-transparent">Wind?</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              whileHover={{
                y: -8,
                boxShadow: "0 10px 32px 0 rgba(56,191,248,0.12)",
                scale: 1.04,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all border border-blue-50 flex flex-col items-center text-center"
            >
              <div className="mb-5">{feat.icon}</div>
              <h3 className="font-semibold text-xl mb-2 text-gray-900">{feat.title}</h3>
              <p className="text-gray-600">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}