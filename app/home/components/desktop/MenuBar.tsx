'use client';

import { Clock, Sun, Moon, Monitor } from 'lucide-react';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkspaceSwitcher } from '../ui/workspace-switcher';
import { WorkspaceHealth } from '../ui/workspace-health';
import { PortShortcutIcon } from '../ui/PortShortcutIcon';

// Custom theme toggle for the menubar with proper colors
function MenuBarThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center w-6 h-6 rounded hover:bg-white/10 transition-colors text-white">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-xl border-white/20">
        <DropdownMenuItem onClick={() => setTheme('light')} className="text-white hover:bg-white/10">
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="text-white hover:bg-white/10">
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="text-white hover:bg-white/10">
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function MenuBar() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
      setCurrentDate(now.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }));
    };

    updateTimeAndDate();
    const interval = setInterval(updateTimeAndDate, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    // Full-width translucent bar
    <div className="absolute inset-x-0 top-0 h-10 flex items-center px-6 z-50 text-white/90 text-sm select-none">
      {/* Date & time – left side */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span>{currentTime}</span>
        <span className="hidden sm:inline">• {currentDate}</span>
      </div>

      {/* Center notch */}
      <div className="relative flex-1 flex justify-center pointer-events-none">
        <div
          className="
            pointer-events-auto
            px-6 py-1.5
            rounded-b-xl
            bg-black/60
            dark:bg-black/70
            backdrop-blur-lg
            border
            border-white/15
            text-base
            font-semibold
            tracking-tight
          "
          style={{
            borderTop: 'none',
            minWidth: '140px'
          }}
        >
          Wind
        </div>
      </div>

      {/* Right utilities */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Theme toggle */}
        <MenuBarThemeToggle />

        {/* User avatar */}
        <SignedIn>
          <div className="flex items-center scale-75">
            <UserButton
              appearance={{
                elements: {
                  userButtonPopoverCard:
                    'bg-black/90 backdrop-blur-xl border-white/20',
                  userButtonPopoverActionButton:
                    'text-white hover:bg-white/10',
                  userButtonPopoverActionButtonText: 'text-white',
                  userButtonPopoverActionButtonIcon: 'text-white',
                  userButtonPopoverFooter: 'hidden',
                },
              }}
            />
          </div>
        </SignedIn>
      </div>
    </div>
  );
}