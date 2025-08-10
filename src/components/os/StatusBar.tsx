import React from "react";

const StatusBar: React.FC<{ onOpenLauncher: () => void }> = ({
  onOpenLauncher,
}) => {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="h-12 w-full flex items-center justify-between px-6 bg-gradient-to-r from-blue-900/70 via-indigo-900/70 to-fuchsia-900/70 backdrop-blur border-b border-white/10 z-20">
      <div className="flex items-center gap-3">
        <button
          className="rounded-full p-2 hover:bg-white/10 transition"
          onClick={onOpenLauncher}
          aria-label="Open App Launcher"
        >
          <span className="w-3 h-3 bg-fuchsia-500 rounded-full inline-block mr-2"></span>
          <span className="font-bold tracking-widest text-white text-lg">Genie OS</span>
        </button>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-white/80 font-mono text-sm">{time}</span>
        {/* System controls stub */}
        <div className="flex items-center gap-2">
          <button className="w-7 h-7 bg-gradient-to-tr from-fuchsia-600 to-indigo-600 rounded-full flex items-center justify-center hover:scale-105 transition" title="Settings">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 01.33 1.82l-0.44 0.76a2 2 0 01-2.73 0.73 1.65 1.65 0 00-1.51-.15 1.65 1.65 0 00-.91 1.21l-0.22 0.87a2 2 0 01-1.97 1.54h-0.88a2 2 0 01-1.97-1.54l-0.22-0.87a1.65 1.65 0 00-.91-1.21 1.65 1.65 0 00-1.51.15 2 2 0 01-2.73-0.73l-0.44-0.76a1.65 1.65 0 01.33-1.82 1.65 1.65 0 000-2.36 1.65 1.65 0 01-.33-1.82l0.44-0.76a2 2 0 012.73-0.73 1.65 1.65 0 001.51.15c0.44-0.19 0.78-0.58 0.91-1.21l0.22-0.87a2 2 0 011.97-1.54h0.88a2 2 0 011.97 1.54l0.22 0.87c0.13 0.63 0.47 1.02 0.91 1.21a1.65 1.65 0 001.51-0.15 2 2 0 012.73 0.73l0.44 0.76a1.65 1.65 0 01-.33 1.82 1.65 1.65 0 000 2.36z"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;