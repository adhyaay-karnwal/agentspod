'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { trackPageView } from '@/lib/analytics';

// Mouse position hook for interactive elements
function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mousePosition;
}

// Animated counter component
const Counter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const currentCount = Math.floor(progress * value);
      
      if (countRef.current !== currentCount) {
        countRef.current = currentCount;
        setCount(currentCount);
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{count.toLocaleString()}</>;
};

// Particle component for floating dots
const Particles = ({ count = 50 }: { count?: number }) => {
  const particles = Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-blue-500/10"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
            ],
            y: [
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
            ],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Grid pattern component
const GridPattern = () => {
  return (
    <div className="fixed inset-0 -z-5 opacity-[0.015] pointer-events-none">
      <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(20,1fr)]">
        {Array.from({ length: 800 }).map((_, i) => (
          <motion.div
            key={i}
            className="border-[0.5px] border-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: i * 0.0005 }}
          />
        ))}
      </div>
    </div>
  );
};

// Floating shapes component
const FloatingShapes = () => {
  const shapes = [
    { type: 'circle', size: 120, color: 'from-blue-400 to-indigo-500', x: '10%', y: '20%' },
    { type: 'triangle', size: 80, color: 'from-purple-400 to-pink-500', x: '80%', y: '60%' },
    { type: 'square', size: 100, color: 'from-emerald-400 to-teal-500', x: '70%', y: '15%' },
    { type: 'pentagon', size: 90, color: 'from-amber-400 to-orange-500', x: '20%', y: '70%' },
    { type: 'hexagon', size: 110, color: 'from-rose-400 to-red-500', x: '85%', y: '85%' },
  ];

  return (
    <div className="fixed inset-0 -z-5 pointer-events-none overflow-hidden">
      {shapes.map((shape, i) => {
        let ShapeElement;
        
        if (shape.type === 'circle') {
          ShapeElement = (
            <div className={`w-full h-full rounded-full bg-gradient-to-br ${shape.color} opacity-30 blur-xl`} />
          );
        } else if (shape.type === 'triangle') {
          ShapeElement = (
            <div className="w-0 h-0 border-l-[50px] border-r-[50px] border-b-[86px] border-l-transparent border-r-transparent border-b-purple-400 opacity-30 blur-md" />
          );
        } else if (shape.type === 'square') {
          ShapeElement = (
            <div className={`w-full h-full rounded-lg bg-gradient-to-br ${shape.color} opacity-30 blur-xl rotate-45`} />
          );
        } else {
          ShapeElement = (
            <div className={`w-full h-full rounded-lg bg-gradient-to-br ${shape.color} opacity-30 blur-xl`} style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} />
          );
        }
        
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: shape.size,
              height: shape.size,
              left: shape.x,
              top: shape.y,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              rotate: [0, shape.type === 'circle' ? 0 : 20, 0],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {ShapeElement}
          </motion.div>
        );
      })}
    </div>
  );
};

export default function HomePage() {
  const mousePosition = useMousePosition();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);
  
  // Animated gradient for hero text
  const [gradientPosition, setGradientPosition] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientPosition((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);
  
  // Track landing page view on client side
  useEffect(() => {
    trackPageView('landing_page');
  }, []);

  return (
    <div className="relative min-h-screen font-berkeley text-black overflow-x-hidden">
      {/* === Background elements === */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,#f0f4ff_0%,#fafafa_40%,#ffffff_70%)]"
      />
      <motion.div
        className="pointer-events-none fixed inset-0 -z-10 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
        transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
      />
      <Particles count={80} />
      <GridPattern />
      <FloatingShapes />

      {/* === Interactive cursor follower === */}
      <motion.div
        className="fixed w-40 h-40 rounded-full bg-blue-400/10 blur-3xl pointer-events-none z-0"
        animate={{
          x: mousePosition.x - 80,
          y: mousePosition.y - 80,
        }}
        transition={{ type: "spring", damping: 15, stiffness: 150 }}
      />

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5
                      backdrop-blur-lg bg-white/70 border-b border-black/10 rounded-b-3xl">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Wind
            </motion.span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link 
              href="/auth/login" 
              className="px-5 py-2 text-sm border border-black rounded-md hover:bg-black/5 transition-colors"
            >
              Login
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link 
              href="/auth/signup" 
              className="px-5 py-2 text-sm bg-black text-white rounded-md hover:bg-black/90 transition-colors"
            >
              Sign Up
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        className="relative pt-60 pb-48 px-6 md:px-16 lg:px-24 max-w-8xl mx-auto overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* === Floating blobs with parallax effect === */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-[-120px] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#b8c3ff] to-[#eaefff] blur-3xl opacity-60 -z-10"
          style={{ y: y1 }}
          animate={{ 
            scale: [1, 1.2, 1], 
            rotate: [0, 60, 0],
            background: [
              'radial-gradient(circle, rgba(184,195,255,0.6) 0%, rgba(234,239,255,0.6) 100%)',
              'radial-gradient(circle, rgba(184,195,255,0.6) 30%, rgba(234,239,255,0.6) 100%)',
              'radial-gradient(circle, rgba(184,195,255,0.6) 0%, rgba(234,239,255,0.6) 100%)',
            ]
          }}
          transition={{ repeat: Infinity, duration: 30, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-40 top-20 w-96 h-96 rounded-full bg-gradient-to-tr from-[#e0e7ff] to-white opacity-40 blur-2xl -z-10"
          style={{ y: y2 }}
          animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
        />

        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            className="text-8xl sm:text-9xl md:text-10xl lg:text-[12rem] xl:text-[14rem] font-bold leading-[0.8] tracking-tight mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              background: `linear-gradient(${gradientPosition}deg, #000000, #3b82f6, #8b5cf6, #000000)`,
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Wind
          </motion.h1>
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-medium mb-10 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The first cloud employee
          </motion.h2>
          <motion.p
            className="mx-auto mb-20 max-w-3xl text-xl md:text-2xl lg:text-3xl text-black/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Wind works autonomously using real applications, just like a human employee. 
            No coding required.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-8 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/signup" 
                className="px-12 py-5 bg-black text-white rounded-xl hover:bg-black/90 transition-all text-lg font-medium shadow-xl hover:shadow-2xl"
              >
                Get started
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="#learn-more" 
                className="px-12 py-5 border-2 border-black rounded-xl hover:bg-black/5 transition-all text-lg font-medium shadow-lg hover:shadow-xl"
              >
                Learn more
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Animated Scroll Indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 bottom-10 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ 
          opacity: { delay: 1.5, duration: 1 },
          y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
        }}
      >
        <div className="text-sm text-gray-500 mb-2">Scroll to explore</div>
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-1">
          <motion.div 
            className="w-1.5 h-1.5 bg-gray-500 rounded-full"
            animate={{ y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Stats / Counters */}
      <section className="py-48 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-16">
          {[
            { label: 'Tasks automated', value: 124000 },
            { label: 'Companies onboarded', value: 320 },
            { label: 'Apps supported', value: 42 }
          ].map(({ label, value }, i) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.05, y: -10 }}
              className="rounded-3xl bg-white/60 backdrop-blur-lg border border-black/10 py-16 px-8 shadow-xl hover:shadow-2xl transition-all text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.span
                className="block text-7xl font-bold tracking-tight bg-gradient-to-br from-black to-gray-600 bg-clip-text text-transparent"
              >
                <Counter value={value} duration={2.5} />
              </motion.span>
              <span className="mt-5 block text-xl text-black/70">{label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Capabilities Section */}
      <section
        id="learn-more"
        className="py-48 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto"
      >
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-5xl md:text-6xl font-semibold tracking-tight mb-8 bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
            Works like a human using mouse and keyboard
          </h2>
          <p className="text-xl md:text-2xl text-black/70">
            Wind can see and interact with actual applications, just like your team members do.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {capabilities.map((capability, index) => (
            <motion.div 
              key={index}
              className="p-10 rounded-3xl bg-white/60 backdrop-blur-lg border border-black/10 shadow-xl transition-all
                         hover:-translate-y-4 hover:shadow-2xl group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.div
                className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl"
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                {capability.icon}
              </motion.div>
              <h3 className="text-2xl font-medium mb-4 group-hover:text-blue-600 transition-colors">{capability.title}</h3>
              <p className="text-black/70 text-lg">{capability.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-48 px-6 md:px-16 lg:px-24 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="max-w-4xl mx-auto text-center mb-24"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tight mb-8 bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
              Loved by teams worldwide
            </h2>
            <p className="text-xl md:text-2xl text-black/70">
              See what our customers are saying about Wind
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="p-10 rounded-3xl bg-white/80 backdrop-blur-lg border border-black/10 shadow-xl relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="mb-8">
                  <p className="text-xl italic text-black/80">&quot;{testimonial.quote}&quot;</p>
                </div>
                <div className="flex items-center">
                  <motion.div 
                    className="w-14 h-14 rounded-full overflow-hidden mr-4 border-2 border-white shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Image 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      width={56}
                      height={56}
                      className="object-cover"
                    />
                  </motion.div>
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-black/60">{testimonial.title}, {testimonial.company}</div>
                  </div>
                </div>
                
                {/* Floating company logo */}
                <motion.div
                  className="absolute -top-6 -right-6 w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center p-3"
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                >
                  <Image 
                    src={testimonial.companyLogo} 
                    alt={testimonial.company}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-48 px-6 md:px-16 lg:px-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center mb-24"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tight mb-8 bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
              How Wind works
            </h2>
            <p className="text-xl md:text-2xl text-black/70">
              Getting started with your cloud employee is simple
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 hidden md:block" />
            
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className="flex flex-col items-center text-center relative z-10"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl mb-8 text-3xl font-bold shadow-xl"
                  whileHover={{ 
                    scale: 1.1, 
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                  }}
                >
                  {index + 1}
                </motion.div>
                <h3 className="text-2xl font-medium mb-4">{step.title}</h3>
                <p className="text-black/70 text-lg">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-48 px-6 md:px-16 lg:px-24 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="max-w-4xl mx-auto text-center mb-24"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tight mb-8 bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
              Simple, transparent pricing
            </h2>
            <p className="text-xl md:text-2xl text-black/70">
              Start for free, upgrade as you grow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`rounded-3xl backdrop-blur-lg border ${
                  plan.featured 
                    ? 'bg-gradient-to-b from-blue-600 to-indigo-700 text-white border-transparent' 
                    : 'bg-white/80 border-black/10 text-black'
                } p-10 shadow-xl relative overflow-hidden`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {plan.featured && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-yellow-400 text-black font-medium py-1 px-4 rounded-bl-lg text-sm shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                <p className={`mb-6 ${plan.featured ? 'text-blue-100' : 'text-black/70'}`}>{plan.description}</p>
                
                <div className="mb-8">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  <span className={`${plan.featured ? 'text-blue-100' : 'text-black/70'}`}>/month</span>
                </div>
                
                <ul className="mb-10 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <div className={`mr-3 mt-1 ${plan.featured ? 'text-blue-200' : 'text-green-500'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className={`${plan.featured ? 'text-white' : 'text-black/80'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.button
                  className={`w-full py-4 px-6 rounded-xl text-lg font-medium ${
                    plan.featured 
                      ? 'bg-white text-blue-600 hover:bg-blue-50' 
                      : 'bg-black text-white hover:bg-black/90'
                  } transition-colors shadow-lg`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {plan.buttonText}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-48 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <motion.div 
          className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-16 text-white shadow-2xl overflow-hidden relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Animated background elements */}
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          />

          <div className="text-center max-w-3xl mx-auto relative z-10">
            <motion.h2 
              className="text-4xl md:text-5xl font-semibold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Stay updated with Wind
            </motion.h2>
            <motion.p 
              className="text-xl text-blue-100 mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Get the latest news, updates, and tips delivered directly to your inbox.
            </motion.p>
            
            <motion.form 
              className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl text-black outline-none focus:ring-2 focus:ring-white text-lg"
                required
              />
              <motion.button
                type="submit"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-medium text-lg hover:bg-blue-50 transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </motion.form>
            
            <motion.p 
              className="mt-6 text-sm text-blue-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              We respect your privacy. Unsubscribe at any time.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-48 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-8 bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
            Get your first cloud employee
          </h2>
          <p className="text-xl md:text-2xl text-black/70 mb-12">
            Join innovative teams already using Wind to automate their workflows.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/signup" 
              className="px-12 py-6 bg-black text-white rounded-xl hover:bg-black/90 transition-all text-xl font-medium shadow-xl hover:shadow-2xl inline-block"
            >
              Start now
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-8 border-t border-gray-100 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
            <div>
              <Link href="/" className="inline-block mb-6">
                <motion.h3
                  className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  Wind
                </motion.h3>
              </Link>
              <p className="text-black/70 mb-6">
                The first cloud employee that works autonomously using real applications.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'linkedin', 'github', 'facebook'].map(social => (
                  <motion.a
                    key={social}
                    href={`#${social}`}
                    className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/70 hover:bg-blue-600 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <span className="sr-only">{social}</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" clipRule="evenodd" />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </div>
            
            {footerLinks.map((column, i) => (
              <div key={i}>
                <h3 className="font-medium text-lg mb-6">{column.title}</h3>
                <ul className="space-y-4">
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <Link 
                        href={link.href} 
                        className="text-black/70 hover:text-blue-600 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-black/60 mb-4 md:mb-0">
              © 2025 Wind. All rights reserved.
            </p>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-sm text-black/60 hover:text-black transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-black/60 hover:text-black transition-colors">Terms</Link>
              <Link href="/cookies" className="text-sm text-black/60 hover:text-black transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Data for the capabilities section
const capabilities = [
  {
    title: 'Customer Support',
    description: 'Wind handles all customer inquiries completely independently – whether via email, chat, WhatsApp, or social media.',
    icon: '💬'
  },
  {
    title: 'Accounting & Invoice',
    description: 'Wind automatically recognizes invoices, extracts data, reconciles them with purchase orders, and logs transactions.',
    icon: '📊'
  },
  {
    title: 'Recruiting Assistant',
    description: 'Wind independently screens applications, checks CVs and social media profiles, and conducts initial interviews.',
    icon: '👥'
  },
  {
    title: 'Social Media',
    description: 'Wind scans current trends, creates posts including graphics, schedules them optimally, and analyzes performance.',
    icon: '📱'
  },
  {
    title: 'Competition Monitoring',
    description: 'Wind keeps track of competitors, analyzes their strategies, and provides insights for your business.',
    icon: '🔍'
  },
  {
    title: 'Website & Product',
    description: 'Wind continuously monitors your website and products, alerting you to any issues or opportunities.',
    icon: '🌐'
  }
];

// Data for the steps section
const steps = [
  {
    title: 'Create your workspace',
    description: 'Set up your personalized Wind workspace in just a few clicks with our intuitive interface.'
  },
  {
    title: 'Install the apps you use',
    description: 'Connect Wind to the applications your team already works with through our seamless integration system.'
  },
  {
    title: 'Let Wind handle the work',
    description: 'Wind takes over repetitive tasks, working autonomously like a human employee while you focus on what matters.'
  }
];

// Data for testimonials
const testimonials = [
  {
    quote: "Wind has completely transformed how our customer support team operates. We've reduced response times by 80% while maintaining our high quality standards.",
    name: "Sarah Johnson",
    title: "Head of Customer Success",
    company: "TechFlow",
    avatar: "/avatars/sarah.jpg",
    companyLogo: "/logos/techflow.svg"
  },
  {
    quote: "Our accounting department now processes invoices 5x faster with Wind. What used to take days now happens automatically in minutes.",
    name: "Michael Chen",
    title: "CFO",
    company: "Quantum Finance",
    avatar: "/avatars/michael.jpg",
    companyLogo: "/logos/quantum.svg"
  },
  {
    quote: "Wind has become our secret weapon for staying ahead of competitors. It monitors market changes and provides insights we would have missed.",
    name: "Elena Rodriguez",
    title: "Marketing Director",
    company: "Innovate Inc",
    avatar: "/avatars/elena.jpg",
    companyLogo: "/logos/innovate.svg"
  },
  {
    quote: "The ROI with Wind has been incredible. We've automated our entire social media strategy and engagement has increased by 200%.",
    name: "James Wilson",
    title: "Social Media Manager",
    company: "Brand Elevate",
    avatar: "/avatars/james.jpg",
    companyLogo: "/logos/brand.svg"
  }
];

// Data for pricing plans
const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for individuals and small teams",
    price: 49,
    features: [
      "1 Wind employee",
      "5 connected applications",
      "Basic automation",
      "Email support",
      "5GB storage"
    ],
    buttonText: "Start free trial",
    featured: false
  },
  {
    name: "Professional",
    description: "Ideal for growing businesses",
    price: 99,
    features: [
      "3 Wind employees",
      "Unlimited applications",
      "Advanced automation",
      "Priority support",
      "25GB storage",
      "Custom integrations"
    ],
    buttonText: "Get started",
    featured: true
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: 249,
    features: [
      "10 Wind employees",
      "Unlimited applications",
      "Advanced automation",
      "24/7 dedicated support",
      "100GB storage",
      "Custom integrations",
      "Advanced security"
    ],
    buttonText: "Contact sales",
    featured: false
  }
];

// Footer links
const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Integrations", href: "#integrations" },
      { label: "Changelog", href: "#changelog" },
      { label: "Roadmap", href: "#roadmap" }
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#docs" },
      { label: "Tutorials", href: "#tutorials" },
      { label: "Blog", href: "#blog" },
      { label: "Support", href: "#support" },
      { label: "Community", href: "#community" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Contact", href: "#contact" },
      { label: "Press", href: "#press" },
      { label: "Partners", href: "#partners" }
    ]
  }
];
