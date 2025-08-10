import React from "react";
import { motion } from "framer-motion";
import { AppMeta } from "./apps";

interface DockProps {
  apps: AppMeta[];
  onLaunch: (appId: string) => void;
  openApps: string[];
  onOpenLauncher: () => void;
}

const Dock: React.FC<DockProps> = ({ apps, onLaunch, openApps, onOpenLauncher }) => {
  return (
    <motion.div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 flex items-end justify-center py-4 w-full pointer-events-none"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
    >
      <div className="bg-gradient-to-br from-blue-950 via-indigo-950 to-fuchsia-950/90 backdrop-blur-2xl rounded-2xl shadow-2xl px-8 py-3 flex gap-6 pointer-events-auto border border-white/10">
        <button
          onClick={onOpenLauncher}
          className="w-12 h-12 bg-gradient-to-tr from-fuchsia-600 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center hover:scale-110 transition"
          title="App Launcher"
        >
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.5"/><circle cx="19" cy="12" r="2.5"/><circle cx="5" cy="12" r="2.5"/></svg>
        </button>
        {apps.map((app) => (
          <motion.button
            whileHover={{ scale: 1.1 }}
            key={app.id}
            onClick={() => onLaunch(app.id)}
            className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition 
              ${openApps.includes(app.id) ? "ring-2 ring-fuchsia-400/70 ring-offset-2" : ""}`}
            title={app.name}
          >
            {typeof app.icon === "string" ? (
              <span className="text-2xl">{app.icon}</span>
            ) : (
              <app.icon />
            )}
            {openApps.includes(app.id) && (
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-fuchsia-400 rounded-full shadow-lg"></span>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default Dock;