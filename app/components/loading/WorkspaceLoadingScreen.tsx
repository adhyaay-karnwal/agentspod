'use client';

import { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface WorkspaceLoadingScreenProps {
  onComplete: () => void;
  workspaceName?: string;
}

export default function WorkspaceLoadingScreen({ 
  onComplete,
  workspaceName = 'your new workspace'
}: WorkspaceLoadingScreenProps) {
  const [animationStage, setAnimationStage] = useState<
    'loading' | 'welcome' | 'complete'
  >('loading');
  
  const dotControls = useAnimation();
  const welcomeControls = useAnimation();
  const subtitleControls = useAnimation();
  const buttonControls = useAnimation();
  
  // Run the animation sequence
  useEffect(() => {
    const runAnimationSequence = async () => {
      // Initial loading animation - dot moving with physics
      await dotControls.start({
        x: [0, window.innerWidth * 0.4],
        transition: {
          duration: 2,
          ease: [0.34, 1.56, 0.64, 1],
          repeat: 1,
          repeatType: 'reverse'
        }
      });
      
      // Switch to welcome stage
      setAnimationStage('welcome');
      
      // Animate welcome text
      await welcomeControls.start({
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1]
        }
      });
      
      // Animate subtitle text
      await subtitleControls.start({
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0.2
        }
      });
      
      // Final dot animation - move to end of text
      await dotControls.start({
        x: window.innerWidth * 0.55,
        scale: [1, 0.8, 1],
        transition: {
          duration: 1.2,
          ease: [0.25, 0.1, 0.25, 1]
        }
      });
      
      // Show the button
      await buttonControls.start({
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0.3
        }
      });
      
      // Animation sequence complete
      setAnimationStage('complete');
    };
    
    runAnimationSequence();
  }, [dotControls, welcomeControls, subtitleControls, buttonControls]);
  
  // Handle begin button click
  const handleBeginClick = () => {
    // Fade out everything
    const fadeOut = async () => {
      await Promise.all([
        dotControls.start({ opacity: 0, transition: { duration: 0.5 } }),
        welcomeControls.start({ opacity: 0, transition: { duration: 0.5 } }),
        subtitleControls.start({ opacity: 0, transition: { duration: 0.5 } }),
        buttonControls.start({ opacity: 0, transition: { duration: 0.5 } })
      ]);
      
      // Call the onComplete callback
      onComplete();
    };
    
    fadeOut();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blue flower background with white overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ 
          /* Soothing sky-to-field gradient that mimics the blue-flower wallpaper without an actual image */
          backgroundImage: `linear-gradient(
            0deg,
            hsl(205 100% 85%) 0%,
            hsl(205 100% 88%) 10%,
            hsl(205 100% 92%) 25%,
            hsl(206 100% 96%) 40%,
            hsl(206 100% 98%) 55%,
            hsl(206 100% 99%) 70%,
            hsl(206 100% 100%) 100%
          ),
          radial-gradient(
            circle at 50% 120%,
            hsl(199 93% 77%) 0%,
            hsl(199 92% 78%) 15%,
            hsl(198 90% 80%) 30%,
            hsl(198 86% 83%) 45%,
            hsl(198 82% 86%) 60%,
            transparent 65%
          )`,
          /* Slight brightness lift to keep it airy */
          filter: "brightness(1.05)"
        }}
      />
      <div className="absolute inset-0 bg-white dark:bg-black bg-opacity-60 dark:bg-opacity-60" />
      
      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
        {/* Animated dot */}
        <motion.div
          className="w-4 h-4 bg-black dark:bg-white rounded-full absolute"
          initial={{ x: -100, opacity: 1 }}
          animate={dotControls}
          style={{ 
            y: animationStage === 'loading' ? 0 : 16,
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: -2,
            marginTop: animationStage === 'loading' ? -2 : 8
          }}
        />
        
        {/* Welcome text */}
        <AnimatePresence>
          {animationStage !== 'loading' && (
            <>
              <motion.h1
                className="text-5xl md:text-7xl font-bold text-black dark:text-white mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={welcomeControls}
              >
                Welcome
              </motion.h1>
              
              <motion.p
                className="text-xl md:text-2xl text-gray-800 dark:text-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={subtitleControls}
              >
                to {workspaceName}
                {/* The dot will animate to become the period after this text */}
              </motion.p>
              
              <motion.div
                className="mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={buttonControls}
              >
                <Button
                  onClick={handleBeginClick}
                  className="px-8 py-6 text-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  Begin
                </Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
