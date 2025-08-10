import React from "react";
import TerminalWindow from "./TerminalWindow";
import CodeEditorWindow from "./CodeEditorWindow";

export interface AppMeta {
  id: string;
  name: string;
  icon: React.ReactNode | string;
  component: React.ComponentType<{ onClose: () => void }>;
}

export const AppsManifest: AppMeta[] = [
  {
    id: "terminal",
    name: "Terminal",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="text-white">
        <rect width="24" height="24" rx="6" fill="#181928" />
        <path d="M7 8l4 4-4 4" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="13" y="16" width="4" height="2" rx="1" fill="#F472B6" />
      </svg>
    ),
    component: TerminalWindow,
  },
  {
    id: "code-editor",
    name: "Code Editor",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="text-white">
        <rect width="24" height="24" rx="6" fill="#181928" />
        <path d="M7 16l4-4-4-4" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="13" y="6" width="4" height="2" rx="1" fill="#38BDF8" />
      </svg>
    ),
    component: CodeEditorWindow,
  },
  // Add more apps here
];