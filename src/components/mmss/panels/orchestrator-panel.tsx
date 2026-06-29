"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AgentCard {
  id: string;
  name: string;
  role: string;
  status: "idle" | "processing" | "done" | "error";
  output: string;
}

const initialAgents: AgentCard[] = [
  {
    id: "1",
    name: "Analyzer",
    role: "Input Analysis",
    status: "idle",
    output: "",
  },
  {
    id: "2",
    name: "PFR Engine",
    role: "Fractal Reassembly",
    status: "idle",
    output: "",
  },
  {
    id: "3",
    name: "FRP Navigator",
    role: "Temporal Navigation",
    status: "idle",
    output: "",
  },
  {
    id: "4",
    name: "Context Weaver",
    role: "Context Integration",
    status: "idle",
    output: "",
  },
  {
    id: "5",
    name: "Synthesizer",
    role: "Response Synthesis",
    status: "idle",
    output: "",
  },
  {
    id: "6",
    name: "Validator",
    role: "Quality Validation",
    status: "idle",
    output: "",
  },
];

const statusColors = {
  idle: "bg-[#8b949e]",
  processing: "bg-yellow-500 animate-pulse",
  done: "bg-emerald-500",
  error: "bg-red-500",
};

const statusLabels = {
  idle: "Idle",
  processing: "Processing...",
  done: "Complete",
  error: "Error",
};

export function OrchestratorPanel() {
  const [agents, setAgents] = useState<AgentCard[]>(initialAgents);
  const [isRunning, setIsRunning] = useState(false);
  const [gridSize, setGridSize] = useState(3);
  const [selectedProvider, setSelectedProvider] = useState("ollama");

  const simulatePipeline = () => {
    setIsRunning(true);
    setAgents(initialAgents.map((a) => ({ ...a, status: "idle", output: "" })));

    const delays = [0, 800, 1600, 2400, 3200, 4000];
    const results = [
      "Analyzed input: 4 semantic layers detected. Domain confidence: 0.92.",
      "Reassembly cycle completed. η_R = 0.87. 12 fractal transforms applied.",
      "Temporal navigation successful. 5 recursive iterations resolved. Chaos reduced to 0.32.",
      "Context weaving complete. Semantic gravity G_S^(2) = 0.91. Cohesion verified.",
      "Synthesized final response. Combined output from 4 modules. Quality score: 0.88.",
      "Validation passed. All outputs consistent. No contradictions detected.",
    ];

    delays.forEach((delay, index) => {
      setTimeout(() => {
        setAgents((prev) =>
          prev.map((a, i) =>
            i === index
              ? { ...a, status: "processing" }
              : i < index
              ? a
              : a
          )
        );
      }, delay);
      setTimeout(() => {
        setAgents((prev) =>
          prev.map((a, i) =>
            i === index
              ? { ...a, status: "done", output: results[index] }
              : a
          )
        );
      }, delay + 700);
    });

    setTimeout(() => {
      setIsRunning(false);
    }, delays[delays.length - 1] + 700);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎼</span>
          <div>
            <h2 className="text-sm font-semibold text-white">
              MMSS Orchestrator
            </h2>
            <p className="text-[10px] text-[#8b949e]">
              Pipeline Coordination Engine
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Button
          onClick={simulatePipeline}
          disabled={isRunning}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7"
        >
          {isRunning ? "Running..." : "▶ Run Auto Cycle"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-[#30363d] text-[#c9d1d9] text-[11px] h-7"
        >
          💾 Save Project
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-[#30363d] text-[#c9d1d9] text-[11px] h-7"
        >
          📥 Download JSON
        </Button>
        <div className="flex items-center gap-1 ml-auto">
          <Badge
            variant="outline"
            className="border-emerald-500/30 text-emerald-400 text-[9px] px-1.5 py-0"
          >
            Provider: {selectedProvider === "ollama" ? "Local Ollama" : "Mistral"}
          </Badge>
          <Badge
            variant="outline"
            className="border-[#30363d] text-[#8b949e] text-[9px] px-1.5 py-0"
          >
            Grid: {gridSize}
          </Badge>
        </div>
      </div>

      {/* Agent Grid */}
      <div
        className="grid gap-2 mb-4"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${Math.ceil(agents.length / gridSize)}, 1fr)`,
        }}
      >
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-lg bg-[#161b22] border border-[#30363d] p-2 flex flex-col min-h-[100px]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`}
                />
                <span className="text-[11px] font-semibold text-white">
                  {agent.name}
                </span>
              </div>
              <span className="text-[9px] text-[#8b949e]">{agent.role}</span>
            </div>
            <div className="flex-1">
              {agent.output ? (
                <p className="text-[10px] text-[#c9d1d9] leading-relaxed">
                  {agent.output}
                </p>
              ) : (
                <p className="text-[10px] text-[#8b949e] italic">
                  {agent.status === "processing"
                    ? "Processing..."
                    : "Awaiting activation..."}
                </p>
              )}
            </div>
            <div className="mt-1.5">
              <Badge
                variant="outline"
                className={`text-[8px] px-1.5 py-0 ${
                  agent.status === "done"
                    ? "border-emerald-500/50 text-emerald-400"
                    : agent.status === "processing"
                    ? "border-yellow-500/50 text-yellow-400"
                    : "border-[#30363d] text-[#8b949e]"
                }`}
              >
                {statusLabels[agent.status]}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
