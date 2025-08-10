import React, { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";

const TerminalWindow: React.FC<{ onClose: () => void }> = () => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let term: any;
    term = new Terminal({
      theme: {
        background: "#181928",
        foreground: "#F472B6",
      },
      fontFamily: "Fira Mono, Menlo, monospace",
      fontSize: 15,
      cursorBlink: true,
      rows: 20,
      cols: 60,
    });
    term.open(terminalRef.current!);
    term.write("Welcome to GenieOS Terminal 🚀\r\n$ ");
    return () => {
      if (term) term.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full p-0 bg-neutral-900 rounded-b-2xl overflow-hidden flex flex-col">
      <div ref={terminalRef} className="flex-1 w-full h-full" />
    </div>
  );
};

export default TerminalWindow;