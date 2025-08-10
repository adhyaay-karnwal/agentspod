import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppMeta } from "./apps";

interface Props {
  apps: AppMeta[];
  onLaunch: (appId: string) => void;
  onClose: () => void;
}

const AppLauncher: React.FC<Props> = ({ apps, onLaunch, onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = apps.filter(app =>
    app.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.16 } }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-950/80 to-fuchsia-900/90 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.98 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 w-full max-w-2xl mx-auto rounded-3xl px-8 pt-12 pb-8 bg-gradient-to-br from-blue-950 via-indigo-950 to-fuchsia-950 shadow-2xl border border-white/10 flex flex-col items-center"
        initial={{ scale: 0.92, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
        onClick={e => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="text"
          className="w-full px-5 py-4 mb-6 rounded-2xl bg-blue-900/50 text-white text-xl font-semibold placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-blue-900/80 transition"
          placeholder="Search apps…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search apps"
        />
        <div className="w-full flex flex-col gap-3 max-h-80 overflow-y-auto">
          {filtered.length === 0 && (
            <span className="p-6 text-center text-white/80 text-lg">No matches.</span>
          )}
          {filtered.map((app) => (
            <motion.button
              key={app.id}
              whileHover={{ scale: 1.04 }}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-900/70 via-indigo-900/70 to-fuchsia-900/70 hover:bg-fuchsia-800/80 border border-white/10 shadow hover:shadow-lg transition"
              onClick={() => onLaunch(app.id)}
            >
              <span className="w-10 h-10 flex items-center justify-center text-2xl">{typeof app.icon === "string" ? app.icon : <app.icon />}</span>
              <span className="font-bold text-lg text-white">{app.name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AppLauncher;