"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PromptGeneratorPanel() {
  const [selectedModule, setSelectedModule] = useState("pfr");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const modules = [
    { id: "pfr", label: "PFR", color: "emerald" },
    { id: "frp", label: "FRP", color: "cyan" },
    { id: "ammss", label: "A-MMSS", color: "violet" },
    { id: "full", label: "Full Pipeline", color: "amber" },
  ];

  const generatePrompt = () => {
    setIsGenerating(true);
    setGeneratedPrompt("");

    const prompts: Record<string, string> = {
      pfr: `# PFR Fractal Reassembly Prompt

Analyze the following domain using the Practical Fractal Reassembly (PFR) engine:

1. Identify all semantic layers and their interconnections
2. Calculate the fractal dimension D_f of the knowledge topology
3. Apply reassembly cycle with parameters:
   - Area (A) = 1.0
   - Entropy (S) = 0.8
   - Topological index (Ξ_topo) = 0.9
   - Semantic weight (W) = 0.95
4. Compute reassembly efficiency: η_R = (ΔV / ΔS_reorganized) × (G_S / Cost_complexity)
5. Evaluate applied value: V = 1 - (C_val ⊗ Φ_Domain) / (G_S × D_f × R_T)

Output the results in structured JSON format with all intermediate calculations.`,
      frp: `# FRP Temporal Navigation Prompt

Navigate the recursive scenario using the Temporal Navigator:

1. Assess current chaos level and plot coherence
2. Map recursive temporal pathways
3. Evaluate emotional trigger states
4. Track iteration index across recursive layers
5. Calculate temporal stability metrics
6. Generate navigation recommendations

Provide a temporal navigation report with pathway analysis and stability metrics.`,
      ammss: `# A-MMSS Context Weaving Prompt

Execute full context weaving cycle:

1. Calculate semantic gravity (2nd order):
   G_S^(2) = (1/R_T^2) × ((S_1_mean + β×Var(S_1))) / (Ξ_topo^(2) ⊗ Φ_topology)
2. Evaluate optimization target:
   opt_A-MMSS = (Φ_fractal_field^(2) × Φ_universal_cohesion) × (1/Cost_eth^(2)) × absolute_contextuality
3. Apply ethical stabilization constraints
4. Measure absolute contextuality index
5. Generate context weaving report

Output results in structured format with all semantic gravity calculations.`,
      full: `# Full MMSS Pipeline Prompt

Execute the complete MMSS multi-level semantic analysis:

## Phase 1: PFR - Fractal Reassembly
- Analyze semantic layers
- Compute reassembly efficiency η_R
- Apply fractal transforms

## Phase 2: FRP - Temporal Navigation
- Map recursive temporal pathways
- Navigate scenarios with emotional triggers
- Track iteration coherence

## Phase 3: A-MMSS - Context Weaving
- Calculate semantic gravity G_S^(2)
- Execute optimization cycle
- Apply ethical stabilization

## Output
Comprehensive analysis report combining all three modules with cross-referenced results.`,
    };

    const targetPrompt = prompts[selectedModule] || prompts.pfr;

    // Simulate typing effect
    let i = 0;
    const interval = setInterval(() => {
      setGeneratedPrompt(targetPrompt.slice(0, i + 20));
      i += 20;
      if (i >= targetPrompt.length) {
        setGeneratedPrompt(targetPrompt);
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 30);

    return () => clearInterval(interval);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">✍️</span>
        <div>
          <h2 className="text-sm font-semibold text-white">
            Prompt Generator
          </h2>
          <p className="text-[10px] text-[#8b949e]">MMSS Prompt Templates</p>
        </div>
      </div>

      {/* Module Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => setSelectedModule(mod.id)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
              selectedModule === mod.id
                ? `bg-${mod.color}-500/20 text-${mod.color}-400 border border-${mod.color}-500/30`
                : "bg-[#161b22] text-[#8b949e] border border-[#30363d] hover:border-[#8b949e]"
            }`}
            style={
              selectedModule === mod.id
                ? {
                    backgroundColor:
                      mod.color === "emerald"
                        ? "rgba(16, 185, 129, 0.2)"
                        : mod.color === "cyan"
                        ? "rgba(6, 182, 212, 0.2)"
                        : mod.color === "violet"
                        ? "rgba(139, 92, 246, 0.2)"
                        : "rgba(245, 158, 11, 0.2)",
                    borderColor:
                      mod.color === "emerald"
                        ? "rgba(16, 185, 129, 0.3)"
                        : mod.color === "cyan"
                        ? "rgba(6, 182, 212, 0.3)"
                        : mod.color === "violet"
                        ? "rgba(139, 92, 246, 0.3)"
                        : "rgba(245, 158, 11, 0.3)",
                    color:
                      mod.color === "emerald"
                        ? "#10b981"
                        : mod.color === "cyan"
                        ? "#06b6d4"
                        : mod.color === "violet"
                        ? "#8b5cf6"
                        : "#f59e0b",
                  }
                : {}
            }
          >
            {mod.label}
          </button>
        ))}
      </div>

      {/* Generate */}
      <Button
        onClick={generatePrompt}
        disabled={isGenerating}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] h-8 mb-4"
      >
        {isGenerating ? "Generating..." : "Generate Prompt"}
      </Button>

      {/* Output */}
      {generatedPrompt && (
        <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3 flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider">
              Generated Prompt
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] text-[#8b949e] h-6 px-2"
              onClick={() => navigator.clipboard.writeText(generatedPrompt)}
            >
              Copy
            </Button>
          </div>
          <pre className="text-[11px] text-[#c9d1d9] whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
            {generatedPrompt}
          </pre>
        </div>
      )}
    </div>
  );
}
