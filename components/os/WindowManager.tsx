import React, { useState } from "react";
import Draggable from "react-draggable";
import { Resizable } from "re-resizable";
import { AnimatePresence, motion } from "framer-motion";


export interface WindowConfig {
  id: string;
  appId: string;
  title: string;
  component: React.ComponentType<{ onClose: () => void }>;
}

interface WindowManagerProps {
  windows: WindowConfig[];
  onClose: (id: string) => void;
}

const WINDOW_DEFAULT = { width: 620, height: 440, minWidth: 320, minHeight: 200 };

const WindowManager: React.FC<WindowManagerProps> = ({ windows, onClose }) => {
  const [zIndices, setZIndices] = useState<string[]>([]);

  const bringToFront = (id: string) => {
    setZIndices((prev) => [...prev.filter((z) => z !== id), id]);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <AnimatePresence>
        {windows.map((win) => {
          const z = zIndices.indexOf(win.id);
          const Component = win.component;
          return (
            <Draggable
              key={win.id}
              handle=".window-titlebar"
              bounds="parent"
              onMouseDown={() => bringToFront(win.id)}
              defaultPosition={{
                x: 160 + Math.random() * 100,
                y: 80 + Math.random() * 60,
              }}
            >
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.93, y: 36 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 60 }}
                transition={{ type: "spring", stiffness: 180, damping: 24 }}
                style={{
                  zIndex: 10 + z,
                  pointerEvents: "auto",
                  position: "absolute" as const,
                }}
              >
                <Resizable
                  defaultSize={{ width: WINDOW_DEFAULT.width, height: WINDOW_DEFAULT.height }}
                  minWidth={WINDOW_DEFAULT.minWidth}
                  minHeight={WINDOW_DEFAULT.minHeight}
                  maxWidth={900}
                  maxHeight={700}
                  enable={{
                    top: true,
                    right: true,
                    bottom: true,
                    left: true,
                    topRight: true,
                    bottomRight: true,
                    bottomLeft: true,
                    topLeft: true,
                  }}
                  className="group"
                >
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-950/95 via-indigo-950/90 to-fuchsia-950/95 rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
                    style={{
                      boxShadow: "0 6px 32px 0 rgba(60,60,110,0.35)",
                    }}>
                    {/* Futuristic cloud/sky shadow */}
                    <div className="absolute -inset-8 z-0 pointer-events-none bg-gradient-to-tl from-sky-500/20 via-indigo-500/10 to-fuchsia-400/10 blur-2xl opacity-60 rounded-3xl" />
                    <div className="window-titlebar flex items-center gap-2 h-11 px-4 z-10 relative cursor-move select-none bg-gradient-to-r from-blue-900/70 via-fuchsia-900/70 to-indigo-900/70 border-b border-white/10">
                      <span className="w-3 h-3 rounded-full bg-fuchsia-500 mr-2 shadow" />
                      <span className="font-semibold text-white text-base tracking-wide grow">{win.title}</span>
                      <button
                        onClick={() => onClose(win.id)}
                        className="rounded-full p-1.5 hover:bg-fuchsia-900/60 hover:scale-110 transition"
                        title="Close"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="flex-1 relative z-10">
                      <Component onClose={() => onClose(win.id)} />
                    </div>
                  </div>
                </Resizable>
              </motion.div>
            </Draggable>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default WindowManager;