'use client';

import { AppMetadata } from '../../apps/BaseApp';
import { 
  AppIconMap, 
  VSCodeIcon, 
  ClaudeIcon, 
  TerminalIcon, 
  SettingsIcon, 
  DiffIcon, 
  WindIcon 
} from './ModernAppIcons';

interface AppIconProps {
  icon: AppMetadata['icon'];
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * AppIcon Component - Displays modern app icons for Wind OS
 * 
 * Features:
 * - Uses modern SVG icons with gradients
 * - Multiple sizes (sm, md, lg, xl)
 * - Consistent styling across the OS
 * - Fallback to Wind icon if type not found
 */
export default function AppIcon({ icon, size = 'md', className = '' }: AppIconProps) {
  // If a custom React component is provided, use it directly
  if (icon.icon) {
    return (
      <div className={className}>
        {icon.icon}
      </div>
    );
  }
  
  // Safely resolve the app type (may be missing on some icons)
  const appType =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore – runtime guard ensures safety
    'type' in icon && typeof icon.type === 'string'
      ? (icon.type as keyof typeof AppIconMap)
      : undefined;
  
  // Select the appropriate icon component based on app type
  let IconComponent;
  
  switch (appType) {
    case 'vscode':
      IconComponent = VSCodeIcon;
      break;
    case 'claude':
      IconComponent = ClaudeIcon;
      break;
    case 'terminal':
      IconComponent = TerminalIcon;
      break;
    case 'settings':
      IconComponent = SettingsIcon;
      break;
    case 'diff':
      IconComponent = DiffIcon;
      break;
    default:
      // Fallback to Wind icon if type not recognized
      IconComponent = WindIcon;
  }
  
  // Render the selected icon with the specified size
  return (
    <IconComponent 
      size={size} 
      className={className} 
    />
  );
}
