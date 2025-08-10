import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StatusBar from "./StatusBar";
import Dock from "./Dock";
import WindowManager, { WindowConfig } from "./WindowManager";
import AppLauncher from "./AppLauncher";
import { AppsManifest } from "./apps";

const Oscape: React.FC = () => {
  const [windows, setWindows] = useState<WindowConfig[]>([]);
  const [launcherOpen, setLauncherOpen] = useState(false);

  const openApp = (appId: string) => {
    const app = AppsManifest.find((a) => a.id === appId);
    if (app) {
      setWindows((prev) => [
        ...prev,
        {
          id: `${appId}-${Date.now()}`,
          appId,
          title: app.name,
          component: app.component,
        },
      ]);
      setLauncherOpen(false);
    }
  };

  const closeWindow = (id: string) =>
    setWindows((prev) => prev.filter((w) => w.id !== id));

  return (
    <div className="relative flex flex-col min-h-screen w-full bg-gradient-to-br from-sky-900 via-indigo-950 to-fuchsia-900 overflow-hidden">
      {/* Top Status Bar */}
      <StatusBar onOpenLauncher={() => setLauncherOpen(true)} />

      {/* App Launcher */}
      <AnimatePresence>
        {launcherOpen && (
          <AppLauncher
            apps={AppsManifest}
            onLaunch={openApp}
            onClose={() => setLauncherOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Canvas */}
      <div className="flex-1 relative z-10">
        <WindowManager windows={windows} onClose={closeWindow} />
      </div>

      {/* Bottom Dock */}
      <Dock
        apps={AppsManifest}
        onLaunch={openApp}
        openApps={windows.map((w) => w.appId)}
        onOpenLauncher={() => setLauncherOpen(true)}
      />

      {/* Futuristic blur overlays */}
      <div className="pointer-events-none absolute -top-32 left-0 w-96 h-96 bg-gradient-to-br from-cyan-500/30 to-blue-700/10 blur-3xl rounded-full opacity-60"></div>
      <div className="pointer-events-none absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-gradient-to-tr from-fuchsia-700/30 to-indigo-700/10 blur-3xl rounded-full opacity-40"></div>
    </div>
  );
};

export default Oscape;