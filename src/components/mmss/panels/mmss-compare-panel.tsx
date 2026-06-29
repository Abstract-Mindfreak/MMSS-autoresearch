"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CompareModel {
  system_id: string;
  evaluation: {
    coherence: number;
    coverage: number;
    reuse: number;
    falsifiability: number;
    overall: number;
  };
}

const models: CompareModel[] = [
  {
    system_id: "MMSS_META_SYNTHESIS_ULTIMATE_v1.0",
    evaluation: { coherence: 0.94, coverage: 0.91, reuse: 0.89, falsifiability: 0.72, overall: 0.92 },
  },
  {
    system_id: "MMSS_QUANTUM_GRAVITY_RELATIVITY_STACK_v1",
    evaluation: { coherence: 0.96, coverage: 0.93, reuse: 0.92, falsifiability: 0.78, overall: 0.94 },
  },
  {
    system_id: "MMSS_PHYSIC_2_0_RETROCAUSAL_AUTOENCODER_v1",
    evaluation: { coherence: 0.91, coverage: 0.87, reuse: 0.85, falsifiability: 0.70, overall: 0.89 },
  },
  {
    system_id: "MMSS_FILOSOF_TOTAL_v1.0",
    evaluation: { coherence: 0.93, coverage: 0.90, reuse: 0.88, falsifiability: 0.74, overall: 0.91 },
  },
];

const axes = ["coherence", "coverage", "reuse", "falsifiability", "overall"] as const;

const demoVerdicts: Record<string, string> = {
  "MMSS_META_SYNTHESIS_ULTIMATE_v1.0_vs_MMSS_QUANTUM_GRAVITY_RELATIVITY_STACK_v1":
    "MMSS_QUANTUM_GRAVITY_RELATIVITY_STACK_v1 wins with a clear advantage in falsifiability (0.78 vs 0.72) and coherence (0.96 vs 0.94). The META_SYNTHESIS model has a more ambitious architectural scope but sacrifices testability. Recommendation: use QG_STACK as the primary template and incorporate META_SYNTHESIS's universal template concepts selectively.",
  "MMSS_META_SYNTHESIS_ULTIMATE_v1.0_vs_MMSS_PHYSIC_2_0_RETROCAUSAL_AUTOENCODER_v1":
    "META_SYNTHESIS_ULTIMATE_v1.0 is significantly better across all dimensions. The PHYSIC_2_0 model shows its age with lower reuse (0.85) and coverage (0.87). Recommendation: migrate PHYSIC_2.0 users to META_SYNTHESIS with domain-specific configuration overlays.",
  "MMSS_QUANTUM_GRAVITY_RELATIVITY_STACK_v1_vs_MMSS_PHYSIC_2_0_RETROCAUSAL_AUTOENCODER_v1":
    "QUANTUM_GRAVITY_RELATIVITY_STACK_v1 dominates on every axis. The largest gap is in falsifiability (+0.08), where the retrocausal autoencoder lacks explicit testability predicates. PHYSIC_2.0 should be considered deprecated in favor of this newer model.",
  "MMSS_META_SYNTHESIS_ULTIMATE_v1.0_vs_MMSS_FILOSOF_TOTAL_v1.0":
    "META_SYNTHESIS edges out FILOSOF_TOTAL on coverage (0.91 vs 0.90) and overall (0.92 vs 0.91), but FILOSOF_TOTAL has stronger philosophical grounding in its Φ_total meta-form. These models are complementary — META_SYNTHESIS for practical applications, FILOSOF_TOTAL for theoretical foundations.",
  "MMSS_QUANTUM_GRAVITY_RELATIVITY_STACK_v1_vs_MMSS_FILOSOF_TOTAL_v1.0":
    "QG_STACK wins on most axes, especially coherence (0.96 vs 0.93) and falsifiability (0.78 vs 0.74). FILOSOF_TOTAL's strength is in its elegant formal notation but it lacks concrete operational definitions. Best approach: combine QG_STACK's testability with FILOSOF_TOTAL's meta-formalism.",
  "MMSS_PHYSIC_2_0_RETROCAUSAL_AUTOENCODER_v1_vs_MMSS_FILOSOF_TOTAL_v1.0":
    "FILOSOF_TOTAL_v1.0 is clearly superior across all dimensions. PHYSIC_2.0 needs significant modernization to compete with current models. The META_G self-loop pattern from FILOSOF_TOTAL could significantly improve PHYSIC_2.0's reuse and coherence scores.",
};

const scoreColor = (score: number) => (score >= 0.9 ? "#10b981" : score >= 0.7 ? "#eab308" : "#ef4444");

export function MMSSComparePanel() {
  const [modelA, setModelA] = useState(models[0].system_id);
  const [modelB, setModelB] = useState(models[1].system_id);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const a = models.find((m) => m.system_id === modelA)!;
  const b = models.find((m) => m.system_id === modelB)!;

  const handleCompare = () => {
    setIsComparing(true);
    setVerdict(null);
    setTimeout(() => {
      const key1 = `${modelA}_vs_${modelB}`;
      const key2 = `${modelB}_vs_${modelA}`;
      const result = demoVerdicts[key1] || demoVerdicts[key2] || `Comparative analysis complete. ${a.system_id} scores ${a.evaluation.overall} overall while ${b.system_id} scores ${b.evaluation.overall}. The delta is ${Math.abs(a.evaluation.overall - b.evaluation.overall).toFixed(4)}.`;
      setVerdict(result);
      setIsComparing(false);
    }, 2000);
  };

  const aWins = a.evaluation.overall > b.evaluation.overall;
  const bWins = b.evaluation.overall > a.evaluation.overall;
  const winner = aWins ? a : bWins ? b : null;

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">⚖️</span>
        <div>
          <h2 className="text-sm font-semibold text-white">MMSS Compare</h2>
          <p className="text-[10px] text-[#8b949e]">Side-by-Side Model Comparison</p>
        </div>
      </div>

      {/* Model Selectors */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-2">
          <label className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider block mb-1">Model A</label>
          <select
            value={modelA}
            onChange={(e) => setModelA(e.target.value)}
            className="w-full bg-[#0d1117] border-[#30363d] text-[#c9d1d9] text-[10px] rounded-md px-1.5 py-1"
          >
            {models.map((m) => (
              <option key={m.system_id} value={m.system_id}>
                {m.system_id.split("_").slice(0, 4).join("_")} ({m.evaluation.overall})
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-2">
          <label className="text-[9px] text-violet-400 font-semibold uppercase tracking-wider block mb-1">Model B</label>
          <select
            value={modelB}
            onChange={(e) => setModelB(e.target.value)}
            className="w-full bg-[#0d1117] border-[#30363d] text-[#c9d1d9] text-[10px] rounded-md px-1.5 py-1"
          >
            {models.map((m) => (
              <option key={m.system_id} value={m.system_id}>
                {m.system_id.split("_").slice(0, 4).join("_")} ({m.evaluation.overall})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Compare Button */}
      <Button
        onClick={handleCompare}
        disabled={isComparing || modelA === modelB}
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] h-7 mb-3"
      >
        {isComparing ? "Analyzing..." : modelA === modelB ? "Select different models" : "🔄 Run Comparison"}
      </Button>

      {/* Comparison Chart */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] text-emerald-400 font-mono">A: {modelA.split("_").slice(0, 3).join("_")}</span>
          <span className="text-[11px] font-semibold text-white">Metric Comparison</span>
          <span className="text-[9px] text-violet-400 font-mono">B: {modelB.split("_").slice(0, 3).join("_")}</span>
        </div>

        <div className="space-y-2">
          {axes.map((axis) => {
            const aVal = a.evaluation[axis];
            const bVal = b.evaluation[axis];
            const aIsBetter = aVal > bVal;

            return (
              <div key={axis}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-[10px] font-mono font-bold ${aIsBetter ? "text-emerald-400" : "text-[#8b949e]"}`}>
                    {aVal.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-[#8b949e] uppercase">{axis}</span>
                  <span className={`text-[10px] font-mono font-bold ${!aIsBetter && bVal !== aVal ? "text-violet-400" : "text-[#8b949e]"}`}>
                    {bVal.toFixed(2)}
                  </span>
                </div>
                <div className="relative w-full h-3 rounded-full bg-[#0d1117]">
                  {/* A bar (grows from left) */}
                  <div className="absolute left-0 top-0 h-full rounded-l-full bg-emerald-500/60 transition-all duration-500" style={{ width: `${aVal * 50}%` }} />
                  {/* B bar (grows from right) */}
                  <div className="absolute right-0 top-0 h-full rounded-r-full bg-violet-500/60 transition-all duration-500" style={{ width: `${bVal * 50}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Winner indicator */}
        {winner && (
          <div className="mt-3 pt-2 border-t border-[#30363d] text-center">
            <span className="text-[10px] text-[#8b949e]">Winner: </span>
            <Badge
              variant="outline"
              className="border-emerald-500/50 text-emerald-400 text-[10px] px-2 py-0.5"
            >
              {winner.system_id.split("_").slice(0, 4).join("_")}
            </Badge>
            <span className="text-[10px] text-[#8b949e] ml-1">
              ({winner.evaluation.overall.toFixed(4)})
            </span>
          </div>
        )}
      </div>

      {/* Verdict */}
      {verdict && (
        <div className="rounded-lg bg-[#161b22] border border-cyan-500/30 p-3">
          <h3 className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-2">LLM Verdict</h3>
          <p className="text-[10px] text-[#c9d1d9] leading-relaxed">{verdict}</p>
        </div>
      )}
    </div>
  );
}
