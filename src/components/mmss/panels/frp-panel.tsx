"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function FRPPanel() {
  const [isActive, setIsActive] = useState(true);
  const [scenarioResult, setScenarioResult] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const scenarioParams = {
    chaos_level: 0.8,
    plot_loss: true,
    scenario_signature: "recursive_dream_loop_001",
    iteration_index: 5,
    previous_iteration: 4,
    emotional_state: "strong",
  };

  const emotionalStates = [
    { label: "Calm", value: "calm", color: "bg-emerald-500" },
    { label: "Moderate", value: "moderate", color: "bg-yellow-500" },
    { label: "Strong", value: "strong", color: "bg-orange-500" },
    { label: "Intense", value: "intense", color: "bg-red-500" },
  ];

  const handleNavigate = () => {
    setIsNavigating(true);
    setTimeout(() => {
      setScenarioResult(
        `Navigation complete. Scenario "${scenarioParams.scenario_signature}" processed at iteration ${scenarioParams.iteration_index}. Emotional state: ${scenarioParams.emotional_state}. Chaos level stabilized at ${(scenarioParams.chaos_level * 0.65).toFixed(3)}. Plot coherence restored. Temporal alignment verified across ${scenarioParams.iteration_index} recursive layers.`
      );
      setIsNavigating(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧭</span>
          <div>
            <h2 className="text-sm font-semibold text-white">
              FRP - Recursive Temporal Navigator
            </h2>
            <p className="text-[10px] text-[#8b949e]">
              Temporal Navigation for Recursive Scenarios
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            isActive
              ? "bg-cyan-500/20 text-cyan-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Scenario Parameters */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3 mb-4">
        <h3 className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
          Scenario Parameters
        </h3>
        <div className="space-y-2">
          {Object.entries(scenarioParams).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between bg-[#0d1117] rounded-md px-2 py-1"
            >
              <span className="text-[10px] text-[#8b949e] font-mono">
                {key}
              </span>
              <span className="text-[11px] text-white font-mono">
                {String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Emotional State Visualizer */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3 mb-4">
        <h3 className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
          Emotional State Spectrum
        </h3>
        <div className="flex items-center gap-1.5">
          {emotionalStates.map((state) => (
            <div
              key={state.value}
              className={`flex-1 text-center`}
            >
              <div
                className={`h-2 rounded-full ${
                  state.color
                } ${
                  state.value === scenarioParams.emotional_state
                    ? "opacity-100"
                    : "opacity-25"
                }`}
              />
              <span
                className={`text-[9px] mt-1 block ${
                  state.value === scenarioParams.emotional_state
                    ? "text-white"
                    : "text-[#8b949e]"
                }`}
              >
                {state.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chaos Level Indicator */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider">
            Chaos Level
          </h3>
          <span className="text-[11px] text-orange-400 font-mono font-bold">
            {scenarioParams.chaos_level}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#0d1117]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500"
            style={{ width: `${scenarioParams.chaos_level * 100}%` }}
          />
        </div>
      </div>

      {/* Action */}
      <Button
        onClick={handleNavigate}
        disabled={isNavigating}
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-[12px] h-8 mb-4"
      >
        {isNavigating ? "Navigating..." : "Navigate Scenario"}
      </Button>

      {/* Result */}
      {scenarioResult && (
        <div className="rounded-lg bg-[#161b22] border border-cyan-500/30 p-3">
          <h3 className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-2">
            Navigation Result
          </h3>
          <p className="text-[11px] text-[#c9d1d9] leading-relaxed">
            {scenarioResult}
          </p>
        </div>
      )}
    </div>
  );
}
