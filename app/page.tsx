'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { trackPageView } from '@/lib/analytics';

export default function HomePage() {
  // Track landing page view on client side
  useEffect(() => {
    trackPageView('landing_page');
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-berkeley">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Wind
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="px-5 py-2 text-sm border border-black rounded-md hover:bg-black/5 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            className="px-5 py-2 text-sm bg-black text-white rounded-md hover:bg-black/90 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        className="pt-40 pb-20 px-8 md:px-16 lg:px-24 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The first cloud employee
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Wind works autonomously using real applications, just like a human employee. 
            No coding required.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link 
              href="/signup" 
              className="px-8 py-3 bg-black text-white rounded-md hover:bg-black/90 transition-colors text-sm"
            >
              Get started
            </Link>
            <Link 
              href="#learn-more" 
              className="px-8 py-3 border border-black rounded-md hover:bg-black/5 transition-colors text-sm"
            >
              Learn more
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Capabilities Section */}
      <section id="learn-more" className="py-20 px-8 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">
            Works like a human using mouse and keyboard
          </h2>
          <p className="text-lg text-gray-600">
            Wind can see and interact with actual applications, just like your team members do.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {capabilities.map((capability, index) => (
            <motion.div 
              key={index}
              className="p-6 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-medium mb-3">{capability.title}</h3>
              <p className="text-gray-600">{capability.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-8 md:px-16 lg:px-24 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              How Wind works
            </h2>
            <p className="text-lg text-gray-600">
              Getting started with your cloud employee is simple
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 flex items-center justify-center bg-black text-white rounded-full mb-4 text-lg font-medium">
                  {index + 1}
                </div>
                <h3 className="text-xl font-medium mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-semibold tracking-tight mb-4">
            Get your first cloud employee
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join innovative teams already using Wind to automate their workflows.
          </p>
          <Link 
            href="/signup" 
            className="px-8 py-3 bg-black text-white rounded-md hover:bg-black/90 transition-colors text-sm inline-block"
          >
            Start now
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <p className="text-sm text-gray-500">© 2025 Wind. All rights reserved.</p>
          </div>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">Privacy</Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">Terms</Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900">Contact</Link>
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
    description: 'Wind handles all customer inquiries completely independently – whether via email, chat, WhatsApp, or social media.'
  },
  {
    title: 'Accounting & Invoice Management',
    description: 'Wind automatically recognizes invoices, extracts data, reconciles them with purchase orders, and logs transactions.'
  },
  {
    title: 'Recruiting Assistant',
    description: 'Wind independently screens applications, checks CVs and social media profiles, and conducts initial interviews.'
  },
  {
    title: 'Social Media Management',
    description: 'Wind scans current trends, creates posts including graphics, schedules them optimally, and analyzes performance.'
  },
  {
    title: 'Competition Monitoring',
    description: 'Wind keeps track of competitors, analyzes their strategies, and provides insights for your business.'
  },
  {
    title: 'Website & Product Monitoring',
    description: 'Wind continuously monitors your website and products, alerting you to any issues or opportunities.'
  }
];

// Data for the steps section
const steps = [
  {
    title: 'Create your workspace',
    description: 'Set up your personalized Wind workspace in just a few clicks.'
  },
  {
    title: 'Install the apps you use',
    description: 'Connect Wind to the applications your team already works with.'
  },
  {
    title: 'Let Wind handle the work',
    description: 'Wind takes over repetitive tasks, working autonomously like a human employee.'
  }
];
