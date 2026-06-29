"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReassemblyResult {
  eta_R: number;
  V_applied: number;
  G_S: number;
  reorganized_complexity: number;
}

export function PFRPanel() {
  const [domain, setDomain] = useState("Financial Analysis");
  const [isActive, setIsActive] = useState(true);
  const [result, setResult] = useState<ReassemblyResult | null>(null);
  const [isComputing, setIsComputing] = useState(false);

  const parameters = {
    area: 1.0,
    S: 0.8,
    Xi_topo: 0.9,
    W: 0.95,
    Psi_opt: 0.9,
    delta_V: 0.6,
    delta_S: 0.4,
    cost: 1.2,
  };

  const handleReassembly = () => {
    setIsComputing(true);
    setTimeout(() => {
      setResult({
        eta_R: 0.87,
        V_applied: 0.73,
        G_S: 0.92,
        reorganized_complexity: 0.65,
      });
      setIsComputing(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔄</span>
          <div>
            <h2 className="text-sm font-semibold text-white">
              PFR - Practical Fractal Reassembly
            </h2>
            <p className="text-[10px] text-[#8b949e]">
              Fractal Reassembly Engine v1.0
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            isActive
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Domain selection */}
      <div className="mb-4">
        <Label className="text-[11px] text-[#8b949e] mb-1.5 block">
          Target Domain
        </Label>
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="bg-[#161b22] border-[#30363d] text-white text-sm h-8"
          placeholder="Enter domain..."
        />
      </div>

      {/* Parameters grid */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3 mb-4">
        <h3 className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
          Parameters
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(parameters).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between bg-[#0d1117] rounded-md px-2 py-1"
            >
              <span className="text-[10px] text-[#8b949e] font-mono">
                {key}
              </span>
              <span className="text-[11px] text-white font-mono">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Formula */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3 mb-4">
        <h3 className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
          Formula
        </h3>
        <div className="bg-[#0d1117] rounded-md p-2 font-mono text-[11px] text-emerald-400">
          η_R = (ΔV / ΔS_reorganized) × (G_S / Cost_complexity)
        </div>
      </div>

      {/* Action */}
      <Button
        onClick={handleReassembly}
        disabled={isComputing}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] h-8 mb-4"
      >
        {isComputing ? "Computing..." : "Run Full Reassembly Cycle"}
      </Button>

      {/* Results */}
      {result && (
        <div className="rounded-lg bg-[#161b22] border border-emerald-500/30 p-3">
          <h3 className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">
            Results
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8b949e]">
                Reassembly Efficiency (η_R)
              </span>
              <span className="text-sm font-bold text-emerald-400">
                {result.eta_R}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8b949e]">
                Applied Value (V)
              </span>
              <span className="text-sm font-mono text-white">
                {result.V_applied}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8b949e]">
                Semantic Gravity (G_S)
              </span>
              <span className="text-sm font-mono text-white">
                {result.G_S}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8b949e]">
                Reorganized Complexity
              </span>
              <span className="text-sm font-mono text-white">
                {result.reorganized_complexity}
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-[#8b949e] mb-1">
              <span>Efficiency</span>
              <span>{Math.round(result.eta_R * 100)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#0d1117]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                style={{ width: `${result.eta_R * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
