"use client";

import React, { useCallback, useRef, useMemo } from "react";
import {
  Layout,
  Model,
  LayoutTestCase,
} from "flexlayout-react";
import "flexlayout-react/style/dark.css";
import { defaultLayoutModel } from "./layout-model";
import { NavigationPanel } from "./panels/navigation-panel";
import { PFRPanel } from "./panels/pfr-panel";
import { FRPPanel } from "./panels/frp-panel";
import { AMMSSPanel } from "./panels/ammss-panel";
import { OrchestratorPanel } from "./panels/orchestrator-panel";
import { GamePanel } from "./panels/game-panel";
import { AIAssistantPanel } from "./panels/ai-assistant-panel";
import { PromptGeneratorPanel } from "./panels/prompt-generator-panel";
import { MetricsPanel } from "./panels/metrics-panel";
import { ConsolePanel } from "./panels/console-panel";
import { Badge } from "@/components/ui/badge";

const factory = (node: LayoutTestCase) => {
  const component = node.getComponent();

  switch (component) {
    case "navigation":
      return <NavigationPanel />;
    case "pfr":
      return <PFRPanel />;
    case "frp":
      return <FRPPanel />;
    case "ammss":
      return <AMMSSPanel />;
    case "orchestrator":
      return <OrchestratorPanel />;
    case "game":
      return <GamePanel />;
    case "aiAssistant":
      return <AIAssistantPanel />;
    case "promptGenerator":
      return <PromptGeneratorPanel />;
    case "metrics":
      return <MetricsPanel />;
    case "console":
      return <ConsolePanel />;
    default:
      return <div className="text-[#c9d1d9] p-4">Unknown component: {component}</div>;
  }
};

export function MMSFlexLayout() {
  const layoutRef = useRef<Layout | null>(null);

  const model = useMemo(() => {
    return Model.fromJson(defaultLayoutModel);
  }, []);

  const onModelChange = useCallback(() => {
    // Layout persistence can be added here
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0d1117]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <h1 className="text-lg font-semibold text-white tracking-tight">
            MMSS System
          </h1>
          <span className="text-xs text-[#8b949e] hidden sm:inline">
            Multi-Level Meta-Semantic System
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-[10px] px-2 py-0.5">
            PFR Active
          </Badge>
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-[10px] px-2 py-0.5">
            FRP Active
          </Badge>
          <Badge variant="outline" className="border-violet-500/50 text-violet-400 text-[10px] px-2 py-0.5">
            A-MMSS Active
          </Badge>
        </div>
      </header>

      {/* FlexLayout container */}
      <div className="flex-1 overflow-hidden">
        <Layout
          ref={layoutRef}
          model={model}
          factory={factory}
          onModelChange={onModelChange}
          className="h-full"
        />
      </div>

      {/* Status bar */}
      <footer className="flex items-center justify-between px-4 py-1.5 bg-[#161b22] border-t border-[#30363d] text-[10px] text-[#8b949e] shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            All Systems Operational
          </span>
          <span>Provider: Local Ollama</span>
        </div>
        <div className="flex items-center gap-4">
          <span>flexlayout-react v0.9</span>
          <span>Next.js + TypeScript</span>
        </div>
      </footer>
    </div>
  );
}
