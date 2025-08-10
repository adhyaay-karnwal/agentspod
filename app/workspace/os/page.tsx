"use client";
import dynamic from "next/dynamic";

const Oscape = dynamic(() => import("src/components/os/Oscape"), { ssr: false });

export default function WorkspaceOSPage() {
  return <Oscape />;
}