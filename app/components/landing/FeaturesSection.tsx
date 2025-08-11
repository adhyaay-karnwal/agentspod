'use client';

import { motion } from 'framer-motion';
import { Monitor, Brain, Smartphone, GitBranch } from 'lucide-react';
import { AgentsBentoGrid, type BentoItem } from '@/components/ui/agents-bento-grid';
import './AgentsOSArchitecture.css';

// Feature list showcasing Wind's key differentiators as the first cloud employee
const windFeatures: BentoItem[] = [
  {
    title: "Works Like a Human",
    meta: "",
    description: "Sees the screen, moves the mouse, types the keyboard.",
    icon: <Monitor className="w-6 h-6 text-blue-600" />, // re-use icon set for now
    tags: [],
    colSpan: 2,
    hasPersistentHover: true,
    showArchitecture: false,
  },
  {
    title: "Real Applications",
    meta: "",
    description: "Chrome, Excel, Outlook – anything your team already loves.",
    icon: <Brain className="w-6 h-6 text-purple-600" />,
    tags: [],
  },
  {
    title: "Truly No-Code",
    meta: "",
    description: "Deploy powerful workflows without engineering effort.",
    icon: <GitBranch className="w-6 h-6 text-green-600" />,
    tags: [],
    colSpan: 2,
  },
  {
    title: "24/7 In the Cloud",
    meta: "",
    description: "Wind runs continuously so your business never sleeps.",
    icon: <Smartphone className="w-6 h-6 text-orange-600" />,
    tags: [],
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="text-gray-900 dark:text-white">
              Meet Your New Cloud Employee
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Wind autonomously operates real software to take entire workflows off your plate.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <AgentsBentoGrid items={windFeatures} />
        </motion.div>
      </div>
    </section>
  );
}