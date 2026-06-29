"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface MMSSModel {
  system_id: string;
  domain: string;
  purpose: string;
  best_score: number;
  last_eval: string;
  version: string;
  evaluation: {
    coherence: number;
    coverage: number;
    reuse: number;
    falsifiability: number;
    overall: number;
  };
}

const initialModels: MMSSModel[] = [
  {
    system_id: "MMSS_META_SYNTHESIS_ULTIMATE_v1.0",
    domain: "Meta-Synthesis",
    purpose: "Universal meta-synthesis of all MMSS subsystems into a single self-looping architecture",
    best_score: 0.92,
    last_eval: "2025-01-15T10:12:30Z",
    version: "v1.0",
    evaluation: { coherence: 0.94, coverage: 0.91, reuse: 0.89, falsifiability: 0.72, overall: 0.92 },
  },
  {
    system_id: "MMSS_QUANTUM_GRAVITY_RELATIVITY_STACK_v1",
    domain: "Physics",
    purpose: "Quantum gravity stack with retrocausal autoencoder for relativistic systems",
    best_score: 0.94,
    last_eval: "2025-01-15T09:45:00Z",
    version: "v1.0",
    evaluation: { coherence: 0.96, coverage: 0.93, reuse: 0.92, falsifiability: 0.78, overall: 0.94 },
  },
  {
    system_id: "MMSS_PHYSIC_2_0_RETROCAUSAL_AUTOENCODER_v1",
    domain: "Physics",
    purpose: "Retrocausal autoencoder with discrete inference steps for physics simulation",
    best_score: 0.89,
    last_eval: "2025-01-14T18:30:00Z",
    version: "v1.0",
    evaluation: { coherence: 0.91, coverage: 0.87, reuse: 0.85, falsifiability: 0.70, overall: 0.89 },
  },
  {
    system_id: "MMSS_FILOSOF_TOTAL_v1.0",
    domain: "Philosophy",
    purpose: "Φ_total unified meta-form wrapping all operators in self-adjusting META_G function",
    best_score: 0.91,
    last_eval: "2025-01-15T11:00:00Z",
    version: "v1.0",
    evaluation: { coherence: 0.93, coverage: 0.90, reuse: 0.88, falsifiability: 0.74, overall: 0.91 },
  },
];

const scoreColor = (score: number) => {
  if (score >= 0.9) return "text-emerald-400";
  if (score >= 0.7) return "text-yellow-400";
  return "text-red-400";
};

const scoreBarColor = (score: number) => {
  if (score >= 0.9) return "bg-emerald-500";
  if (score >= 0.7) return "bg-yellow-500";
  return "bg-red-500";
};

export function MMSSModelsPanel() {
  const [models, setModels] = useState<MMSSModel[]>(initialModels);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState("");
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);

  const poolStats = {
    total: models.length,
    avgScore: models.reduce((a, m) => a + m.best_score, 0) / models.length,
    bestModel: models.reduce((best, m) => m.best_score > best.best_score ? m : best, models[0]),
  };

  const handleSingleImprove = (systemId: string) => {
    setModels((prev) =>
      prev.map((m) => {
        if (m.system_id === systemId) {
          const improved = Math.min(0.999, m.best_score + Math.random() * 0.03);
          return {
            ...m,
            best_score: parseFloat(improved.toFixed(4)),
            last_eval: new Date().toISOString(),
            evaluation: {
              ...m.evaluation,
              coherence: Math.min(1, m.evaluation.coherence + (Math.random() - 0.3) * 0.02),
              coverage: Math.min(1, m.evaluation.coverage + (Math.random() - 0.3) * 0.02),
              reuse: Math.min(1, m.evaluation.reuse + (Math.random() - 0.3) * 0.02),
              falsifiability: Math.min(1, m.evaluation.falsifiability + (Math.random() - 0.3) * 0.02),
              overall: parseFloat(improved.toFixed(4)),
            },
          };
        }
        return m;
      })
    );
  };

  const handleCloneToTopic = () => {
    if (!newTopicName.trim()) return;
    const baseModel = models[0];
    const newModel: MMSSModel = {
      system_id: `MMSS_${newTopicName.toUpperCase().replace(/\s+/g, "_")}_v1.0`,
      domain: newTopicName,
      purpose: `Cloned from ${baseModel.system_id} adapted for ${newTopicName} domain`,
      best_score: parseFloat((baseModel.best_score * (0.85 + Math.random() * 0.1)).toFixed(4)),
      last_eval: new Date().toISOString(),
      version: "v1.0",
      evaluation: {
        coherence: parseFloat((baseModel.evaluation.coherence * (0.88 + Math.random() * 0.1)).toFixed(2)),
        coverage: parseFloat((baseModel.evaluation.coverage * (0.85 + Math.random() * 0.1)).toFixed(2)),
        reuse: parseFloat((baseModel.evaluation.reuse * (0.90 + Math.random() * 0.08)).toFixed(2)),
        falsifiability: parseFloat((baseModel.evaluation.falsifiability * (0.82 + Math.random() * 0.12)).toFixed(2)),
        overall: 0,
      },
    };
    newModel.evaluation.overall = parseFloat(((newModel.evaluation.coherence + newModel.evaluation.coverage + newModel.evaluation.reuse + newModel.evaluation.falsifiability) / 4).toFixed(4));
    setModels((prev) => [...prev, newModel]);
    setNewTopicName("");
    setShowNewTopicForm(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧬</span>
          <div>
            <h2 className="text-sm font-semibold text-white">MMSS Models</h2>
            <p className="text-[10px] text-[#8b949e]">Fitness Landscape Pool</p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-violet-600 hover:bg-violet-700 text-white text-[10px] h-6 px-2"
          onClick={() => setShowNewTopicForm(!showNewTopicForm)}
        >
          + New from Topic
        </Button>
      </div>

      {/* New Topic Form */}
      {showNewTopicForm && (
        <div className="rounded-lg bg-[#161b22] border border-violet-500/30 p-3 mb-3">
          <h3 className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider mb-2">Clone to New Topic</h3>
          <div className="flex gap-2">
            <Input
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Topic name (e.g. Biology, Economics)..."
              className="flex-1 bg-[#0d1117] border-[#30363d] text-white text-[11px] h-7"
            />
            <Button
              size="sm"
              onClick={handleCloneToTopic}
              disabled={!newTopicName.trim()}
              className="bg-violet-600 hover:bg-violet-700 text-white text-[10px] h-7"
            >
              Clone
            </Button>
          </div>
        </div>
      )}

      {/* Pool Stats */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-2.5 mb-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold font-mono text-white">{poolStats.total}</div>
            <div className="text-[9px] text-[#8b949e]">Total Models</div>
          </div>
          <div>
            <div className={`text-lg font-bold font-mono ${scoreColor(poolStats.avgScore)}`}>{poolStats.avgScore.toFixed(3)}</div>
            <div className="text-[9px] text-[#8b949e]">Avg Score</div>
          </div>
          <div>
            <div className="text-[10px] font-bold font-mono text-emerald-400 leading-tight">{poolStats.bestModel.system_id.split("_").slice(0, 3).join("_")}</div>
            <div className="text-[9px] text-[#8b949e]">Best ({poolStats.bestModel.best_score})</div>
          </div>
        </div>
      </div>

      {/* Model List */}
      <div className="space-y-2">
        {models.map((model) => (
          <div
            key={model.system_id}
            className="rounded-lg bg-[#161b22] border border-[#30363d] p-3 cursor-pointer hover:border-emerald-500/30 transition-colors"
            onClick={() => setSelectedModel(selectedModel === model.system_id ? null : model.system_id)}
          >
            {/* Model Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-[#30363d] text-[#8b949e] shrink-0">
                  {model.domain}
                </Badge>
                <span className="text-[11px] font-mono text-white truncate">{model.system_id}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-sm font-bold font-mono ${scoreColor(model.best_score)}`}>
                  {model.best_score}
                </span>
              </div>
            </div>

            {/* Score Bars */}
            <div className="grid grid-cols-4 gap-1 mb-2">
              {(["coherence", "coverage", "reuse", "falsifiability"] as const).map((metric) => (
                <div key={metric}>
                  <div className="flex justify-between text-[8px] text-[#8b949e] mb-0.5">
                    <span>{metric.slice(0, 4)}</span>
                    <span className={scoreColor(model.evaluation[metric])}>{model.evaluation[metric]}</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-[#0d1117]">
                    <div className={`h-full rounded-full ${scoreBarColor(model.evaluation[metric])}`} style={{ width: `${model.evaluation[metric] * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Purpose */}
            <p className="text-[9px] text-[#8b949e] line-clamp-1">{model.purpose}</p>

            {/* Expanded Details */}
            {selectedModel === model.system_id && (
              <div className="mt-2 pt-2 border-t border-[#30363d]">
                <div className="flex gap-2 mb-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] h-6"
                    onClick={(e) => { e.stopPropagation(); handleSingleImprove(model.system_id); }}
                  >
                    🔧 Improve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-[#30363d] text-[#c9d1d9] text-[10px] h-6"
                    onClick={(e) => { e.stopPropagation(); setShowNewTopicForm(true); }}
                  >
                    📋 Clone
                  </Button>
                </div>
                <div className="bg-[#0d1117] rounded-md p-2">
                  <p className="text-[9px] text-[#8b949e]">
                    <span className="text-cyan-400">Version:</span> {model.version} | <span className="text-cyan-400">Eval:</span> {new Date(model.last_eval).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
