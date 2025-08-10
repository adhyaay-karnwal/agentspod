import dynamic from "next/dynamic";

const LoadingScreen = dynamic(
  () => import("@/components/workspace/LoadingScreen"),
  { ssr: false }
);

export default function WorkspaceLoading() {
  return <LoadingScreen />;
}