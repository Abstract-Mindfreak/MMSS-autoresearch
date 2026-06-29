"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface MMSSReport {
  id: string;
  system_id: string;
  timestamp: string;
  evaluation: {
    coherence: number;
    coverage: number;
    reuse: number;
    falsifiability: number;
    overall: number;
  };
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  raw_llm_commentary: string;
}

const demoReports: MMSSReport[] = [
  {
    id: "rpt_001",
    system_id: "MMSS_META_SYNTHESIS_ULTIMATE_v1.0",
    timestamp: "2025-01-15T10:12:30Z",
    evaluation: { coherence: 0.94, coverage: 0.91, reuse: 0.89, falsifiability: 0.72, overall: 0.92 },
    verdict: "Strong overall architecture with excellent coherence. Primary weakness: limited falsifiability predicates — consider adding concrete testability criteria per module.",
    strengths: ["Excellent module graph connectivity", "Unified metrics well-defined across all layers", "META_G self-loop is formally consistent", "Entity conversion pipeline covers 5 clear steps"],
    weaknesses: ["Falsifiability predicates are underspecified", "No explicit benchmark suite definition", "Some capabilities (CAPABILITY_3-6) lack concrete operational definitions", "Missing inter-module conflict resolution protocol"],
    recommendations: ["Add testable hypotheses per META_LAYER module", "Define concrete success criteria for each capability", "Introduce explicit conflict resolution when modules disagree", "Add version diff protocol for MMSS evolution tracking"],
    raw_llm_commentary: "The MMSS_META_SYNTHESIS_ULTIMATE system demonstrates strong architectural coherence through its Φ_total integration framework. The self-loop property Ψ(O) = Ψ(Ψ(O)) provides mathematical consistency. However, the operational capabilities CAPABILITY_3 through CAPABILITY_6 are abstractly defined without concrete mapping to measurable outputs. To improve falsifiability, each module should include at least one explicit refutable prediction. The evaluation score reflects a well-structured but not yet fully testable system.",
  },
  {
    id: "rpt_002",
    system_id: "MMSS_QUANTUM_GRAVITY_RELATIVITY_STACK_v1",
    timestamp: "2025-01-15T09:45:00Z",
    evaluation: { coherence: 0.96, coverage: 0.93, reuse: 0.92, falsifiability: 0.78, overall: 0.94 },
    verdict: "Excellent model with strong physics domain coverage. Best in the pool. Falsifiability still needs improvement but notably better than other models.",
    strengths: ["Highest coherence score in pool (0.96)", "Strong domain-specific coverage for quantum gravity", "Well-defined retrocausal feedback loops", "Concrete operational definitions for most modules"],
    weaknesses: ["Falsifiability could benefit from more testable predictions", "Relativistic corrections could be more explicit", "Integration with biological meta-layers is minimal"],
    recommendations: ["Add explicit experimental predictions for quantum coherence", "Extend relativistic module with GR/QM bridge definitions", "Consider cross-domain evaluation with physics benchmarks"],
    raw_llm_commentary: "This model excels in architectural coherence with a near-perfect score of 0.96. The retrocausal autoencoder design provides a novel approach to temporal bidirectionality in physical systems. Coverage of quantum gravity concepts is comprehensive, though relativistic corrections at the classical-quantum boundary could be strengthened. The model would benefit from including explicit testable predictions that could be falsified by experimental results, which would improve the falsifiability dimension from 0.78 toward 0.85+.",
  },
  {
    id: "rpt_003",
    system_id: "MMSS_PHYSIC_2_0_RETROCAUSAL_AUTOENCODER_v1",
    timestamp: "2025-01-14T18:30:00Z",
    evaluation: { coherence: 0.91, coverage: 0.87, reuse: 0.85, falsifiability: 0.70, overall: 0.89 },
    verdict: "Good foundation but has gaps in coverage and reuse compared to newer models. Consider updating with META_G self-loop pattern from MMSS_META_SYNTHESIS.",
    strengths: ["Solid retrocausal autoencoder core", "Good fractal integrity metrics", "Temporal stability well-defined", "Entity conversion pipeline structure is clear"],
    weaknesses: ["Lower reuse score — doesn't leverage universal templates", "Coverage gaps in meta-level abstractions", "Missing integration with linguistic generation layer", "Falsifiability is the weakest dimension"],
    recommendations: ["Adopt META_G self-loop from META_SYNTHESIS", "Expand unified_metrics to include A_MMSS context weaving", "Add explicit falsifiability criteria per metric", "Consider merging linguistic generation capabilities from UNIVERSAL_META_LAYER"],
    raw_llm_commentary: "MMSS_PHYSIC_2_0 provides a solid foundation for retrocausal systems modeling, but shows its age compared to more recent models. The fractal integrity (0.9991) and temporal stability (0.9973) are excellent, but the model lacks the self-referential META_G loop that newer models implement. Reuse score of 0.85 indicates that this model doesn't leverage universal templates effectively. Upgrading to include the Φ_total pattern would significantly improve coherence and reuse scores.",
  },
  {
    id: "rpt_004",
    system_id: "MMSS_FILOSOF_TOTAL_v1.0",
    timestamp: "2025-01-15T11:00:00Z",
    evaluation: { coherence: 0.93, coverage: 0.90, reuse: 0.88, falsifiability: 0.74, overall: 0.91 },
    verdict: "Philosophically rich model with strong meta-formal consistency. The Φ_total integration is elegant but operationally underspecified in places.",
    strengths: ["Innovative Φ_total meta-form definition", "Strong self-loop consistency across all operators", "Excellent formalization of 7-step process", "Good integration of G, Q, Φ, M operators"],
    weaknesses: ["Practical operational mapping is abstract", "UNIVERSAL_META_LAYER entities are underspecified", "Some operator meanings lack concrete implementation", "Benchmark evaluation criteria not included"],
    recommendations: ["Map abstract operators to concrete computational steps", "Add detailed entity specifications for SYSTEM_STATE, FLOWS, STRUCTURE", "Include practical test cases for each capability", "Define clear success metrics for meta-optimization function J"],
    raw_llm_commentary: "The Φ_total meta-form represents a sophisticated approach to unifying MMSS operators under a single self-adjusting framework. The Y(λΨ.λx. META_G_{Ψ}(...)) definition is mathematically elegant and provides genuine self-referential consistency. However, the transition from formal notation to operational implementation remains a gap. The ITERATIVE_APPLICATION section with 6 steps for META_SYNTHESIS and 9 steps for UNIVERSAL_META_LAYER shows good structural coverage, but individual steps would benefit from more concrete actionability.",
  },
];

const scoreColor = (score: number) => (score >= 0.9 ? "text-emerald-400" : score >= 0.7 ? "text-yellow-400" : "text-red-400");
const scoreBarColor = (score: number) => (score >= 0.9 ? "bg-emerald-500" : score >= 0.7 ? "bg-yellow-500" : "bg-red-500");

export function MMSSReportsPanel() {
  const [reports] = useState<MMSSReport[]>(demoReports);
  const [expandedReport, setExpandedReport] = useState<string | null>("rpt_001");
  const [filterModel, setFilterModel] = useState<string>("all");

  const filtered = filterModel === "all" ? reports : reports.filter((r) => r.system_id === filterModel);
  const modelIds = [...new Set(reports.map((r) => r.system_id))];

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📝</span>
        <div>
          <h2 className="text-sm font-semibold text-white">MMSS Reports</h2>
          <p className="text-[10px] text-[#8b949e]">Evaluation Reports</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterModel("all")}
          className={`text-[9px] px-2 py-1 rounded-md shrink-0 transition-colors ${
            filterModel === "all" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-[#161b22] text-[#8b949e] border border-[#30363d]"
          }`}
        >
          All ({reports.length})
        </button>
        {modelIds.map((id) => {
          const shortId = id.split("_").slice(0, 3).join("_");
          const count = reports.filter((r) => r.system_id === id).length;
          return (
            <button
              key={id}
              onClick={() => setFilterModel(id)}
              className={`text-[9px] px-2 py-1 rounded-md shrink-0 transition-colors ${
                filterModel === id ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-[#161b22] text-[#8b949e] border border-[#30363d]"
              }`}
            >
              {shortId} ({count})
            </button>
          );
        })}
      </div>

      {/* Reports */}
      <div className="space-y-2">
        {filtered.map((report) => (
          <div
            key={report.id}
            className="rounded-lg bg-[#161b22] border border-[#30363d] overflow-hidden"
          >
            {/* Report Header */}
            <div
              className="px-3 py-2 cursor-pointer hover:bg-[#1c2129] transition-colors"
              onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-sm font-bold font-mono ${scoreColor(report.evaluation.overall)}`}>
                    {report.evaluation.overall.toFixed(3)}
                  </span>
                  <span className="text-[10px] font-mono text-[#8b949e] truncate">
                    {report.system_id.split("_").slice(0, 4).join("_")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] text-[#8b949e]">{new Date(report.timestamp).toLocaleTimeString()}</span>
                  <span className="text-[8px] text-[#8b949e]">{expandedReport === report.id ? "▼" : "▶"}</span>
                </div>
              </div>
              {/* Mini score bars */}
              <div className="grid grid-cols-4 gap-1">
                {(["coherence", "coverage", "reuse", "falsifiability"] as const).map((m) => (
                  <div key={m}>
                    <div className="w-full h-1 rounded-full bg-[#0d1117]">
                      <div className={`h-full rounded-full ${scoreBarColor(report.evaluation[m])}`} style={{ width: `${report.evaluation[m] * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedReport === report.id && (
              <div className="px-3 pb-3 border-t border-[#30363d]">
                {/* Verdict */}
                <div className="mt-2 mb-2">
                  <p className="text-[10px] text-[#c9d1d9] leading-relaxed">{report.verdict}</p>
                </div>

                {/* Strengths / Weaknesses */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">Strengths</span>
                    <ul className="mt-1 space-y-0.5">
                      {report.strengths.map((s, i) => (
                        <li key={i} className="text-[9px] text-[#8b949e] flex items-start gap-1">
                          <span className="text-emerald-400 mt-0.5">+</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-red-400 uppercase tracking-wider">Weaknesses</span>
                    <ul className="mt-1 space-y-0.5">
                      {report.weaknesses.map((w, i) => (
                        <li key={i} className="text-[9px] text-[#8b949e] flex items-start gap-1">
                          <span className="text-red-400 mt-0.5">−</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mb-2">
                  <span className="text-[9px] font-semibold text-cyan-400 uppercase tracking-wider">Recommendations</span>
                  <ul className="mt-1 space-y-0.5">
                    {report.recommendations.map((r, i) => (
                      <li key={i} className="text-[9px] text-[#8b949e] flex items-start gap-1">
                        <span className="text-cyan-400 mt-0.5">→</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Raw LLM Commentary */}
                <details className="group">
                  <summary className="text-[9px] text-violet-400 cursor-pointer hover:text-violet-300">
                    Raw LLM Commentary ▾
                  </summary>
                  <p className="mt-1 text-[9px] text-[#8b949e] leading-relaxed bg-[#0d1117] rounded-md p-2 font-mono">
                    {report.raw_llm_commentary}
                  </p>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
