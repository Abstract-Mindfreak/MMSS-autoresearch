"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊", section: "main" },
  { id: "activate", label: "Activate", icon: "⚡", section: "main" },
  { id: "pfr", label: "PFR", icon: "🔄", section: "modules" },
  { id: "frp", label: "FRP", icon: "🧭", section: "modules" },
  { id: "ammss", label: "A-MMSS", icon: "🧬", section: "modules" },
  { id: "prompt", label: "Prompt Gen", icon: "✍️", section: "tools" },
  { id: "game", label: "Game", icon: "🎮", section: "tools" },
  { id: "ai", label: "AI Assistant", icon: "🤖", section: "tools" },
  { id: "orchestrator", label: "Orchestrator", icon: "🎼", section: "tools" },
  { id: "auto_research", label: "Auto Research", icon: "🔬", section: "research" },
  { id: "mmss_models", label: "MMSS Models", icon: "🧬", section: "research" },
  { id: "mmss_reports", label: "MMSS Reports", icon: "📝", section: "research" },
  { id: "mmss_compare", label: "MMSS Compare", icon: "⚖️", section: "research" },
  { id: "tasks", label: "Tasks", icon: "📋", section: "system" },
  { id: "settings", label: "Settings", icon: "⚙️", section: "system" },
];

const sections = [
  { id: "main", label: "Main" },
  { id: "modules", label: "Modules" },
  { id: "tools", label: "Tools" },
  { id: "research", label: "Research" },
  { id: "system", label: "System" },
];

export function NavigationPanel() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] overflow-y-auto">
      {/* System info */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-lg">🧠</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">MMSS System</p>
            <p className="text-[10px] text-[#8b949e]">v2.0 Full Stack</p>
          </div>
        </div>

        {/* System status */}
        <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-2 mb-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#8b949e]">System Status</span>
            <span className="text-emerald-400 font-medium">Operational</span>
          </div>
          <div className="flex gap-1 mt-1.5">
            <div className="flex-1 h-1 rounded-full bg-emerald-500" />
            <div className="flex-1 h-1 rounded-full bg-cyan-500" />
            <div className="flex-1 h-1 rounded-full bg-violet-500" />
          </div>
          <div className="flex justify-between text-[9px] text-[#8b949e] mt-1">
            <span>PFR</span>
            <span>FRP</span>
            <span>A-MMSS</span>
          </div>
        </div>
      </div>

      <Separator className="bg-[#30363d]" />

      {/* Navigation sections */}
      <div className="flex-1 px-2 py-2">
        {sections.map((section) => (
          <div key={section.id} className="mb-1">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider hover:text-[#c9d1d9] transition-colors"
            >
              {section.label}
              <span className="text-[8px]">
                {collapsedSections.has(section.id) ? "▶" : "▼"}
              </span>
            </button>
            {!collapsedSections.has(section.id) && (
              <div className="space-y-0.5">
                {navItems
                  .filter((item) => item.section === section.id)
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveItem(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12px] transition-all ${
                        activeItem === item.id
                          ? "bg-[#1f6feb]/20 text-[#58a6ff] border-l-2 border-[#1f6feb]"
                          : "hover:bg-[#161b22] text-[#c9d1d9] border-l-2 border-transparent"
                      }`}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Separator className="bg-[#30363d]" />

      {/* Quick actions */}
      <div className="px-3 py-2">
        <Button
          size="sm"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7"
        >
          ⚡ Activate All Systems
        </Button>
      </div>
    </div>
  );
}
