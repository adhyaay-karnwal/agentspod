'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { trackButtonClick } from '@/lib/analytics';

interface HeroSectionProps {
  shouldShowWaitlist: boolean;
}

export function HeroSection({ shouldShowWaitlist }: HeroSectionProps) {
  // Animation variants
  // Define easing tuples typed as readonly to satisfy Framer-Motion’s `Easing`
  const standardEase = [0.25, 0.1, 0.25, 1] as const;
  const springEase   = [0.34, 1.56, 0.64, 1] as const;

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        ease: standardEase
      }
    }
  };
  
  const slideUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.2 + i * 0.15,
        ease: standardEase
      }
    })
  };

  // Wind logo component (double W concept)
  const WindLogo = () => (
    <motion.svg 
      width="128" 
      height="63" 
      viewBox="0 0 128 63" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: springEase }}
      className="w-24 h-12 md:w-32 md:h-16 mb-6"
    >
      <path d="M0 6.78516C6.20895 -0.764753 25.5426 -2.38267 32.5967 6.78516C39.6467 15.9478 65.508 55.274 65.5391 55.3213C52.2588 65.0286 39.8403 65.388 31.2168 53.3438C22.6091 41.3215 0.0836674 6.91297 0 6.78516Z" fill="currentColor"/>
      <path d="M45.2217 6.78516C51.4306 -0.764754 70.7643 -2.38267 77.8184 6.78516C84.8644 15.9426 110.702 55.2313 110.761 55.3213C97.4805 65.0286 85.063 65.388 76.4395 53.3438C67.8292 41.318 45.291 6.89112 45.2217 6.78516Z" fill="currentColor"/>
      <path d="M113.154 0.500977C121.276 0.501108 128 7.08523 128 15.207C128 23.3288 121.276 29.913 113.154 29.9131C105.032 29.9131 98.3086 23.3289 98.3086 15.207C98.3086 7.08515 105.032 0.500977 113.154 0.500977Z" fill="currentColor"/>
    </motion.svg>
  );

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-[#030303] dark:to-[#050505]">
      {/* Top navigation with login/signup buttons */}
      <motion.div 
        className="absolute top-0 right-0 p-6 z-20 flex gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Link href="/login">
          <Button 
            variant="outline" 
            className="px-6 py-2 text-sm font-medium bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-full transition-all"
            onClick={() => trackButtonClick('login', 'hero_section')}
          >
            Login
          </Button>
        </Link>
        <Link href="/signup">
          <Button 
            className="px-6 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full transition-all"
            onClick={() => trackButtonClick('signup', 'hero_section')}
          >
            Sign Up
          </Button>
        </Link>
      </motion.div>

      {/* Main hero content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-32 pb-24 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          {/* Logo */}
          <WindLogo />

          {/* Main heading */}
          <motion.h1 
            className="text-6xl sm:text-7xl md:text-8xl font-bold mb-6 tracking-tight"
            custom={0}
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
          >
            <span className="text-black dark:text-white">
              Wind
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p 
            className="text-xl sm:text-2xl md:text-3xl text-gray-600 dark:text-gray-300 mb-16 font-light"
            custom={1}
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
          >
            The first cloud employee
          </motion.p>

          {/* App icons row */}
          <motion.div
            className="flex justify-center gap-4 mb-16 overflow-hidden"
            custom={2}
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
          >
            <img 
              src="/assets/appsRow_desktop.webp" 
              alt="Apps" 
              className="w-full max-w-3xl object-contain"
            />
          </motion.div>

          {/* CTA Button */}
          <motion.div
            custom={3}
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            className="flex justify-center"
          >
            {shouldShowWaitlist ? (
              <Button 
                size="lg" 
                className="px-10 py-6 text-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full shadow-lg hover:shadow-xl transition-all"
                onClick={() => document.getElementById('waitlist-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Join our waitlist
              </Button>
            ) : (
              <Link href="/home" className="w-auto">
                <Button 
                  size="lg" 
                  className="px-10 py-6 text-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full shadow-lg hover:shadow-xl transition-all"
                  onClick={() => trackButtonClick('launch_workspace', 'hero_section')}
                >
                  Launch Wind
                </Button>
              </Link>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/30 dark:to-black/30 pointer-events-none" />
    </section>
  );
}
