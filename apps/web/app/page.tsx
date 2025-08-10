'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import AppWindow from '@/components/AppWindow'
import AppStore from '@/components/AppStore'
import WindLogo from '@/components/WindLogo'
import EmailApp from '@/components/apps/EmailApp'
import SocialApp from '@/components/apps/SocialApp'

export default function Home() {
  // State for showing/hiding app store
  const [showAppStore, setShowAppStore] = useState(false)
  
  // State for showing/hiding email app
  const [showEmailApp, setShowEmailApp] = useState(true)
  
  // State for showing/hiding social app
  const [showSocialApp, setShowSocialApp] = useState(true)
  
  // Toggle app store visibility
  const toggleAppStore = () => {
    setShowAppStore(!showAppStore)
  }
  
  // Close app store
  const closeAppStore = () => {
    setShowAppStore(false)
  }
  
  // Close email app
  const closeEmailApp = () => {
    setShowEmailApp(false)
  }
  
  // Reopen email app
  const openEmailApp = () => {
    setShowEmailApp(true)
  }

  // Close social app
  const closeSocialApp = () => {
    setShowSocialApp(false)
  }

  // Reopen social app
  const openSocialApp = () => {
    setShowSocialApp(true)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      {/* Welcome Message */}
      <div className="glass-panel p-8 text-center max-w-xl slide-up">
        <div className="flex justify-center mb-4">
          <WindLogo className="h-20 w-auto wind-logo" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Wind</h1>
        <p className="text-lg mb-6">
          Your autonomous cloud employee
        </p>
        <button 
          onClick={toggleAppStore}
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105"
        >
          Browse apps
        </button>
      </div>
      
      {/* App Store Modal */}
      {showAppStore && (
        <AppStore onClose={closeAppStore} isOpen={showAppStore} />
      )}
      
      {/* Sample Email App Window */}
      {showEmailApp && (
        <AppWindow 
          title="Mail" 
          onClose={closeEmailApp}
          initialPosition={{ x: 50, y: 100 }}
          className="w-[700px] h-[500px]"
        >
          <EmailApp />
        </AppWindow>
      )}
      
      {/* Social App Window */}
      {showSocialApp && (
        <AppWindow
          title="Social"
          onClose={closeSocialApp}
          initialPosition={{ x: 120, y: 160 }}
          className="w-[650px] h-[500px]"
        >
          <SocialApp />
        </AppWindow>
      )}
      
      {/* Bottom Avatars */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
        <button 
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-neutral-800 hover:scale-110 transition-transform"
          onClick={openEmailApp}
        >
          <div className="w-full h-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center text-primary-700 dark:text-primary-200">
            <span className="text-sm font-medium">ME</span>
          </div>
        </button>
        <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-neutral-800 hover:scale-110 transition-transform">
          <div className="w-full h-full bg-secondary-200 dark:bg-secondary-700 flex items-center justify-center text-secondary-700 dark:text-secondary-200">
            <span className="text-sm font-medium">SJ</span>
          </div>
        </button>
        <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-neutral-800 hover:scale-110 transition-transform">
          <div className="w-full h-full bg-success-200 dark:bg-success-700 flex items-center justify-center text-success-700 dark:text-success-200">
            <span className="text-sm font-medium">AC</span>
          </div>
        </button>
        {/* Avatar to reopen Social App */}
        <button
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-neutral-800 hover:scale-110 transition-transform"
          onClick={openSocialApp}
        >
          <div className="w-full h-full bg-secondary-300 dark:bg-secondary-600 flex items-center justify-center text-secondary-800 dark:text-secondary-100">
            <span className="text-sm font-medium">SO</span>
          </div>
        </button>
      </div>
    </div>
  )
}
