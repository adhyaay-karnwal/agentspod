'use client';

import { useState } from 'react';
import Workspace from './components/Workspace';
import WorkspaceLoadingScreen from '../components/loading/WorkspaceLoadingScreen';

/**
 * Home page entry for Wind OS
 * Shows an animated loading / welcome sequence before revealing the workspace.
 */
export default function WindPage() {
  // Whether to show the custom loading / welcome animation
  const [showLoading, setShowLoading] = useState(true);

  return (
    <div className="fixed inset-0 bg-gray-900 overflow-hidden">
      {/* Mount workspace immediately so it can start fetching / booting in the background */}
      <Workspace />

      {/* Overlay loading screen */}
      {showLoading && (
        <WorkspaceLoadingScreen
          onComplete={() => setShowLoading(false)}
        />
      )}
    </div>
  );
}