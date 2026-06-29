"use client";

import dynamic from "next/dynamic";

const MMSFlexLayout = dynamic(
  () => import("@/components/mmss/mms-flex-layout").then((mod) => ({ default: mod.MMSFlexLayout })),
  { ssr: false, loading: () => (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0d1117] text-[#8b949e]">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg mb-3 animate-pulse">
        M
      </div>
      <p className="text-sm">Loading MMSS System...</p>
    </div>
  )}
);

export default function Home() {
  return <MMSFlexLayout />;
}
