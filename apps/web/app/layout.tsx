import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'

// Components
import StatusBar from '@/components/StatusBar'
import ChatBar from '@/components/ChatBar'
import WindLogo from '@/components/WindLogo'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Wind – Autonomous cloud employee',
  description: 'Wind is an AI-first operating system designed to be a cloud employee that can replace your workspace.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wallpaper Background */}
        <div className="wallpaper-background" style={{ backgroundImage: 'url(/wallpaper.svg)' }}>
          <div className="gradient-overlay"></div>
        </div>
        
        {/* Main Layout */}
        <div className="flex flex-col h-screen w-screen overflow-hidden">
          {/* Top Status Bar */}
          <header className="glass-panel z-10 px-4 py-2 flex justify-between items-center">
            <div className="flex items-center">
              <WindLogo className="h-8 w-auto wind-logo mr-2" />
              <span className="text-sm font-medium">Wind</span>
            </div>
            <StatusBar />
          </header>
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-4 relative">
            <div className="fade-in">
              {children}
            </div>
          </main>
          
          {/* Footer Chat Bar */}
          <footer className="glass-panel z-10 p-4">
            <ChatBar />
          </footer>
        </div>
      </body>
    </html>
  )
}
