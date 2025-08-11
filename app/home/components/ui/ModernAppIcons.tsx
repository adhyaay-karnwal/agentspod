import React from 'react';

interface AppIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Size mapping for different icon sizes
const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

// Base icon component with common styling
const IconBase: React.FC<AppIconProps & { children: React.ReactNode }> = ({ 
  size = 'md', 
  className = '', 
  children 
}) => {
  const pixelSize = sizeMap[size];
  
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ 
        width: pixelSize, 
        height: pixelSize,
      }}
    >
      {children}
    </div>
  );
};

// VSCode Icon - Modern blue/purple code editor icon
export const VSCodeIcon: React.FC<AppIconProps> = (props) => {
  return (
    <IconBase {...props}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="vscode-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2C7FFF" />
            <stop offset="100%" stopColor="#7341FF" />
          </linearGradient>
          <filter id="vscode-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodOpacity="0.3" />
          </filter>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#vscode-gradient)" filter="url(#vscode-shadow)" />
        <path 
          d="M16.5 4.5L7.5 12L16.5 19.5" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M7.5 4.5L16.5 12L7.5 19.5" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    </IconBase>
  );
};

// Claude Icon - AI/chat bubble with modern gradients
export const ClaudeIcon: React.FC<AppIconProps> = (props) => {
  return (
    <IconBase {...props}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="claude-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8C52FF" />
            <stop offset="100%" stopColor="#5E17EB" />
          </linearGradient>
          <filter id="claude-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodOpacity="0.3" />
          </filter>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#claude-gradient)" filter="url(#claude-shadow)" />
        <path 
          d="M12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18H7C6.44772 18 6 17.5523 6 17V12C6 8.68629 8.68629 6 12 6Z" 
          fill="white" 
          fillOpacity="0.9" 
        />
        <circle cx="9" cy="12" r="1" fill="#5E17EB" />
        <circle cx="12" cy="12" r="1" fill="#5E17EB" />
        <circle cx="15" cy="12" r="1" fill="#5E17EB" />
      </svg>
    </IconBase>
  );
};

// Terminal Icon - Modern terminal/console
export const TerminalIcon: React.FC<AppIconProps> = (props) => {
  return (
    <IconBase {...props}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="terminal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#202020" />
            <stop offset="100%" stopColor="#404040" />
          </linearGradient>
          <filter id="terminal-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodOpacity="0.3" />
          </filter>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#terminal-gradient)" filter="url(#terminal-shadow)" />
        <path 
          d="M7 12L10 15M10 9L7 12" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M13 16H17" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
      </svg>
    </IconBase>
  );
};

// Settings Icon - Modern gear/settings
export const SettingsIcon: React.FC<AppIconProps> = (props) => {
  return (
    <IconBase {...props}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="settings-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <filter id="settings-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodOpacity="0.3" />
          </filter>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#settings-gradient)" filter="url(#settings-shadow)" />
        <path 
          d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
          stroke="white" 
          strokeWidth="1.5" 
        />
        <path 
          d="M18.7273 14.5455C18.4909 15.1091 18.6 15.7455 19.0364 16.1818L19.1091 16.2545C19.4631 16.6084 19.6613 17.0762 19.6613 17.5636C19.6613 18.051 19.4631 18.5188 19.1091 18.8727C18.7552 19.2267 18.2873 19.4249 17.8 19.4249C17.3126 19.4249 16.8448 19.2267 16.4909 18.8727L16.4182 18.8C15.9818 18.3636 15.3455 18.2545 14.7818 18.4909C14.2364 18.7091 13.8727 19.2364 13.8727 19.8182V20C13.8727 20.9818 13.0727 21.7818 12.0909 21.7818C11.1091 21.7818 10.3091 20.9818 10.3091 20V19.9091C10.2909 19.3091 9.9 18.7818 9.33636 18.5455C8.77273 18.3091 8.13636 18.4182 7.7 18.8545L7.62727 18.9273C7.27337 19.2812 6.80552 19.4794 6.31818 19.4794C5.83085 19.4794 5.363 19.2812 5.00909 18.9273C4.65514 18.5833 4.45693 18.1155 4.45693 17.6282C4.45693 17.1408 4.65514 16.673 5.00909 16.3291L5.08182 16.2564C5.51818 15.82 5.62727 15.1836 5.39091 14.62C5.17273 14.0745 4.64545 13.7109 4.06364 13.7109H3.88182C3.39457 13.7109 2.9268 13.5127 2.57294 13.1588C2.21909 12.8049 2.02091 12.337 2.02091 11.8498C2.02091 11.3625 2.21909 10.8946 2.57294 10.5407C2.9268 10.1868 3.39457 9.98863 3.88182 9.98863H3.97273C4.57273 9.98863 5.1 9.59772 5.33636 9.03409C5.57273 8.47045 5.46364 7.83409 5.02727 7.39772L4.95455 7.32499C4.6006 6.97109 4.40239 6.50324 4.40239 6.0159C4.40239 5.52857 4.6006 5.06072 4.95455 4.70681C5.30845 4.35286 5.7763 4.15465 6.26364 4.15465C6.75097 4.15465 7.21883 4.35286 7.57273 4.70681L7.64545 4.77954C8.08182 5.2159 8.71818 5.32499 9.28182 5.08863H9.33636C9.88182 4.87045 10.2455 4.34318 10.2455 3.76136V3.57954C10.2455 3.09229 10.4437 2.62452 10.7976 2.27066C11.1514 1.91681 11.6193 1.71863 12.1065 1.71863C12.5938 1.71863 13.0616 1.91681 13.4155 2.27066C13.7694 2.62452 13.9676 3.09229 13.9676 3.57954V3.67045C13.9676 4.25227 14.3313 4.77954 14.8768 4.99772C15.4404 5.23409 16.0768 5.12499 16.5132 4.68863L16.5859 4.6159C16.9398 4.26195 17.4077 4.06374 17.895 4.06374C18.3823 4.06374 18.8502 4.26195 19.2041 4.6159C19.558 4.9698 19.7562 5.43766 19.7562 5.92499C19.7562 6.41233 19.558 6.88018 19.2041 7.23409L19.1313 7.30681C18.695 7.74318 18.5859 8.37954 18.8222 8.94318V9.00681C19.0404 9.55227 19.5677 9.9159 20.1495 9.9159H20.3313C20.8186 9.9159 21.2864 10.1141 21.6403 10.468C21.9941 10.8218 22.1923 11.2897 22.1923 11.777C22.1923 12.2642 21.9941 12.7321 21.6403 13.0859C21.2864 13.4398 20.8186 13.638 20.3313 13.638H20.2404C19.6586 13.638 19.1313 14.0016 18.9132 14.5471L18.7273 14.5455Z" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    </IconBase>
  );
};

// Diff Icon - Modern comparison/diff
export const DiffIcon: React.FC<AppIconProps> = (props) => {
  return (
    <IconBase {...props}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="diff-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>
          <filter id="diff-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodOpacity="0.3" />
          </filter>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#diff-gradient)" filter="url(#diff-shadow)" />
        <path 
          d="M8 10H16M8 14H16" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M6 10L6 14" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M18 10L18 14" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M9 6L15 6" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M9 18L15 18" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
      </svg>
    </IconBase>
  );
};

// Wind Logo Icon - Branded icon for Wind OS
export const WindIcon: React.FC<AppIconProps> = (props) => {
  return (
    <IconBase {...props}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wind-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <filter id="wind-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodOpacity="0.3" />
          </filter>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#wind-gradient)" filter="url(#wind-shadow)" />
        <path 
          d="M4 9C5.2 7.2 8.4 6.9 9.8 9C11.2 11.1 15.8 18.5 15.8 18.5C13.5 20.3 11.2 20.4 9.6 18.1C8 15.8 4 9 4 9Z" 
          fill="white" 
          fillOpacity="0.9" 
        />
        <path 
          d="M12.2 9C13.4 7.2 16.6 6.9 18 9C19.4 11.1 24 18.5 24 18.5C21.7 20.3 19.4 20.4 17.8 18.1C16.2 15.8 12.2 9 12.2 9Z" 
          fill="white" 
          fillOpacity="0.9" 
        />
      </svg>
    </IconBase>
  );
};

// Export a mapping of app types to their icon components
export const AppIconMap = {
  vscode: VSCodeIcon,
  claude: ClaudeIcon,
  terminal: TerminalIcon,
  settings: SettingsIcon,
  diff: DiffIcon,
  wind: WindIcon
};

// Main AppIcon component that renders the appropriate icon based on type
interface AppIconComponentProps extends AppIconProps {
  type: keyof typeof AppIconMap;
}

export default function AppIcon({ type, ...props }: AppIconComponentProps) {
  const IconComponent = AppIconMap[type] || WindIcon;
  return <IconComponent {...props} />;
}
