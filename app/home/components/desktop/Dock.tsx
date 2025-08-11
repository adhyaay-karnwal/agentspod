'use client';

import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useWindowAnimation } from '../../hooks/useWindowAnimation';
import { Code } from 'lucide-react';
import { DOCK_Z_INDEX } from '../../constants/layout';
import { getAllApps, getApp, AppStore } from '../../apps';
import AppIcon from '../ui/AppIcon';
import React, { useState, useEffect } from 'react';

// macOS-style Tooltip Component
interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const MacTooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-gray-900/95 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl border border-gray-600/30 whitespace-nowrap">
            {text}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-gray-900/95"></div>
        </div>
      )}
    </div>
  );
};

export default function Dock() {
  const { 
    getActiveWorkspace, 
    addWindow, 
    restoreWindow, 
    focusWindow, 
    setWindowAnimating 
  } = useWorkspaceStore();
  
  const activeWorkspace = getActiveWorkspace();
  const windows = activeWorkspace?.windows || [];
  const minimizedWindows = windows.filter(w => w.minimized);

  // Calculate dock width based on number of apps
  const [dockWidth, setDockWidth] = useState('auto');
  
  useEffect(() => {
    // Calculate width based on number of items
    const totalApps = getAllApps().length;
    const totalItems = totalApps + (minimizedWindows.length > 0 ? minimizedWindows.length + 1 : 0); // +1 for separator
    const baseWidth = 140; // Minimum width
    const itemWidth = 64; // Width per item including spacing
    const calculatedWidth = Math.max(baseWidth, totalItems * itemWidth);
    setDockWidth(`${calculatedWidth}px`);
  }, [minimizedWindows.length]);

  // Window animation hook for restore animations
  const { animateRestoreFromTarget } = useWindowAnimation({
    onAnimationComplete: () => {
      // Animation complete callback handled per window
    }
  });

  const handleAppClick = (type: 'vscode' | 'claude' | 'diff' | 'settings' | 'terminal' | 'setup') => {
    // Only work with the active workspace
    if (!activeWorkspace) return;
    
    // Check if there's already a window of this type
    const existingWindow = windows.find(w => w.type === type && !w.minimized);
    
    if (existingWindow) {
      focusWindow(existingWindow.id);
      return;
    }

    // Check if there's a minimized window of this type
    const minimizedWindow = windows.find(w => w.type === type && w.minimized);
    if (minimizedWindow) {
      restoreWindow(minimizedWindow.id);
      focusWindow(minimizedWindow.id);
      return;
    }

    // Get app from registry
    const app = getApp(type);
    if (!app) return;

    // Don't create windows for coming soon apps
    if (app.metadata.comingSoon) {
      // TODO: Show coming soon toast
      return;
    }

    // Calculate position based on app config
    const position = app.window.position === 'center' 
      ? { x: (window.innerWidth - app.window.defaultSize.width) / 2, y: (window.innerHeight - app.window.defaultSize.height) / 2 }
      : app.window.position === 'cascade'
      ? { x: 100 + Math.random() * 200, y: 100 + Math.random() * 150 }
      : app.window.position;

    // Get repository URLs for this workspace
    const repositoryUrl = (() => {
      switch (type) {
        case 'vscode':
          return activeWorkspace.repository.urls?.vscode || '';
        case 'claude':
          return activeWorkspace.repository.urls?.claude || '';
        case 'terminal':
          return activeWorkspace.repository.urls?.terminal || '';
        default:
          return '';
      }
    })();

    addWindow({
      type,
      title: `${app.metadata.name} - ${activeWorkspace.name}`,
      position,
      size: app.window.defaultSize,
      minimized: false,
      maximized: false,
      focused: true,
      repositoryName: activeWorkspace.name,
      repositoryUrl,
    });
  };

  const handleMinimizedWindowClick = (windowId: string) => {
    const window = windows.find(w => w.id === windowId);
    if (!window) return;

    // First restore the window to make it visible
    restoreWindow(windowId);
    focusWindow(windowId);

    // Then try to animate if elements are available
    if (typeof document !== 'undefined') {
      setTimeout(() => {
        if (typeof document === 'undefined') return; // Safety check for SSR/tests
        
        const windowElement = document.querySelector(`[data-testid="window-${windowId}"]`) as HTMLElement;
        const dockIcon = document.querySelector(`[data-dock-icon="${window.type}"]`) as HTMLElement;
        
        if (windowElement && dockIcon) {
          setWindowAnimating(windowId, true);
          animateRestoreFromTarget(windowElement, dockIcon, {
            x: window.position.x,
            y: window.position.y + 32, // Account for menu bar
            width: window.size.width,
            height: window.size.height
          }).addEventListener('finish', () => {
            setWindowAnimating(windowId, false);
          });
        }
      }, 50); // Small delay to ensure DOM is updated
    }
  };

  const getAppIcon = (type: string) => {
    const app = AppStore[type as keyof typeof AppStore];
    if (!app) return <Code className="w-6 h-6" />;
    
    return <AppIcon icon={app.metadata.icon} size="md" />;
  };

  // Don't render dock if no active workspace
  if (!activeWorkspace) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-0 left-1/2 transform -translate-x-1/2 flex justify-center"
      style={{ zIndex: DOCK_Z_INDEX }}
    >
      {/* Bottom notch container */}
      <div 
        className="relative"
        style={{ width: dockWidth }}
      >
        <div
          className="
            px-6 py-3
            rounded-t-xl
            bg-black/60
            dark:bg-black/70
            backdrop-blur-lg
            border
            border-white/15
            flex items-center justify-center gap-3
            transition-all duration-300
          "
          style={{
            borderBottom: 'none',
            minWidth: '140px'
          }}
        >
          {/* Main app icons */}
          {getAllApps().map((app) => (
            <MacTooltip key={app.metadata.id} text={app.metadata.name}>
              <DockIcon
                onClick={() => handleAppClick(app.metadata.id as 'vscode' | 'claude' | 'diff' | 'settings' | 'terminal' | 'setup')}
                className={`${app.metadata.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                dataAttribute={app.metadata.id}
                disabled={app.metadata.comingSoon}
                isActive={windows.some(w => w.type === app.metadata.id && !w.minimized)}
              >
                {getAppIcon(app.metadata.id)}
              </DockIcon>
            </MacTooltip>
          ))}

          {/* Separator */}
          {minimizedWindows.length > 0 && (
            <div className="w-px h-8 bg-white/25 mx-1" />
          )}

          {/* Minimized windows */}
          {minimizedWindows.map((window) => (
            <MacTooltip key={window.id} text={window.title}>
              <DockIcon
                onClick={() => handleMinimizedWindowClick(window.id)}
                className="relative"
                dataAttribute={window.type}
                isMinimized
              >
                {getAppIcon(window.type)}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-lg" />
              </DockIcon>
            </MacTooltip>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DockIconProps {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
  dataAttribute?: string;
  disabled?: boolean;
  isActive?: boolean;
  isMinimized?: boolean;
}

function DockIcon({ 
  onClick, 
  className = "", 
  children, 
  dataAttribute, 
  disabled = false,
  isActive = false,
  isMinimized = false
}: DockIconProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`
        w-12 h-12 rounded-xl flex items-center justify-center text-white
        transition-all duration-300 ease-out
        hover:scale-110 hover:shadow-xl hover:-translate-y-1
        active:scale-95
        ${isActive ? 'bg-white/20' : 'bg-white/10'}
        backdrop-blur-md
        border ${isActive ? 'border-white/30' : 'border-white/15'}
        shadow-lg
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
      }}
      data-dock-icon={dataAttribute}
      disabled={disabled}
    >
      {children}
      {isActive && !isMinimized && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
      )}
    </button>
  );
}
