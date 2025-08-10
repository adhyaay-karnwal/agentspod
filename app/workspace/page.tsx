import dynamic from "next/dynamic";

const LoadingScreen = dynamic(
  () => import("@/components/workspace/LoadingScreen"),
  { ssr: false }
);

export default function WorkspacePage() {
  // For now, always show the loading screen as the immersive launch experience.
  return <LoadingScreen />;
}