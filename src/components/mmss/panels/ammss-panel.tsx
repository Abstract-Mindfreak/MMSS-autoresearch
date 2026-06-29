"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export function AMMSSPanel() {
  const [isActive, setIsActive] = useState(true);
  const [result, setResult] = useState<{
    G_S2: number;
    optimized: number;
    contextuality: number;
  } | null>(null);
  const [isWeaving, setIsWeaving] = useState(false);

  const contextData = {
    R_T: 1.0,
    S_1_mean: 0.3,
    S_1_var: 0.05,
    beta: 0.5,
    Xi_topo_2: 0.95,
    N_2: 0.05,
    C_val_2: 0.1,
    Phi_meta_self: 1.0,
    lambda: 0.1,
    Cost_eth_1_sum: 0.8,
    Phi_fractal_field: 0.98,
    Psi_co_2: 0.95,
    resonance: 1.0,
    Phi_universal_cohesion: 0.98,
    absolute_contextuality: 0.95,
    S_2: 0.0,
  };

  const handleWeave = () => {
    setIsWeaving(true);
    setTimeout(() => {
      setResult({
        G_S2: 0.91,
        optimized: 0.85,
        contextuality: 0.95,
      });
      setIsWeaving(false);
    }, 1800);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧬</span>
          <div>
            <h2 className="text-sm font-semibold text-white">
              A-MMSS - Context Weaver
            </h2>
            <p className="text-[10px] text-[#8b949e]">
              Context Weaving with Ethical Stabilization v2.0
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            isActive
              ? "bg-violet-500/20 text-violet-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Context Data */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3 mb-4">
        <h3 className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
          Context Parameters
        </h3>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
          {Object.entries(contextData).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between bg-[#0d1117] rounded-md px-2 py-1"
            >
              <span className="text-[9px] text-[#8b949e] font-mono">
                {key}
              </span>
              <span className="text-[10px] text-white font-mono">
                {typeof value === "boolean" ? (value ? "true" : "false") : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Semantic Gravity Formula */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3 mb-4">
        <h3 className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
          Semantic Gravity (2nd Order)
        </h3>
        <div className="bg-[#0d1117] rounded-md p-2 font-mono text-[10px] text-violet-400 leading-relaxed">
          G_S^(2) = (1/R_T^2) × ( + β×Var(S^(1))) /
          (Ξ_topo^(2) ⊗ Φ_topology ⊗ Φ_prob)
          × (Φ_q_flow / (1 - N^(2))^2)
        </div>
      </div>

      {/* Optimization Formula */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3 mb-4">
        <h3 className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
          Optimization Target
        </h3>
        <div className="bg-[#0d1117] rounded-md p-2 font-mono text-[10px] text-violet-400">
          opt_A-MMSS = (Φ_fractal_field^(2) × Φ_universal_cohesion)
          × (1/Cost_eth^(2)) × absolute_contextuality
        </div>
      </div>

      {/* Action */}
      <Button
        onClick={handleWeave}
        disabled={isWeaving}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white text-[12px] h-8 mb-4"
      >
        {isWeaving ? "Weaving Context..." : "Run Full Context Weaving Cycle"}
      </Button>

      {/* Results */}
      {result && (
        <div className="rounded-lg bg-[#161b22] border border-violet-500/30 p-3">
          <h3 className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider mb-2">
            Weaving Results
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#8b949e]">Semantic Gravity G_S^(2)</span>
                <span className="text-violet-400">{result.G_S2}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#0d1117]">
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{ width: `${result.G_S2 * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#8b949e]">Optimization Level</span>
                <span className="text-violet-400">{result.optimized}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#0d1117]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  style={{ width: `${result.optimized * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#8b949e]">Absolute Contextuality</span>
                <span className="text-violet-400">{result.contextuality}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#0d1117]">
                <div
                  className="h-full rounded-full bg-fuchsia-500"
                  style={{ width: `${result.contextuality * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
