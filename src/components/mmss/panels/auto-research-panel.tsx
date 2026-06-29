"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface RoundLog {
  round: number;
  timestamp: string;
  asset: string;
  asset_kind: string;
  change_description: string;
  new_score: number;
  decision: "kept" | "reverted";
  ollama_model_used: string | null;
}

interface LoopConfig {
  mode: "numeric" | "mmss";
  max_rounds: number;
  target_score: number;
  epsilon: number;
  stop_after_no_improve: number;
  ollama_model: string;
  use_ollama: boolean;
  operation: "mmss_improve" | "mmss_clone_to_new_topic" | "mmss_compare" | "mmss_prompt_tune";
}

const operations = [
  { value: "mmss_improve", label: "Improve MMSS", icon: "🔧", desc: "Improve existing MMSS via LLM" },
  { value: "mmss_clone_to_new_topic", label: "Clone to Topic", icon: "📋", desc: "Clone MMSS to new domain" },
  { value: "mmss_compare", label: "Compare Two", icon: "⚖️", desc: "Compare two MMSS models" },
  { value: "mmss_prompt_tune", label: "Prompt Tune", icon: "✍️", desc: "Tune MMSS-specific prompts" },
];

const demoLogs: RoundLog[] = [
  { round: 0, timestamp: "2025-01-15T10:00:00Z", asset: "mmss_specs/MMSS_META_SYNTHESIS_ULTIMATE_v1.0.json", asset_kind: "mmss_spec", change_description: "unified_metrics.coherence.current_value: 0.94 -> 0.95", new_score: 0.8942, decision: "reverted", ollama_model_used: "qwen2.5-coder:7b" },
  { round: 1, timestamp: "2025-01-15T10:02:30Z", asset: "llm/prompts/work/mmss_synthesis.md", asset_kind: "prompt", change_description: "prompt_text: length 2340 -> 2391", new_score: 0.9101, decision: "kept", ollama_model_used: "qwen2.5-coder:7b" },
  { round: 2, timestamp: "2025-01-15T10:05:00Z", asset: "python/configs/active.yaml", asset_kind: "config", change_description: "config.sigma: 0.012 -> 0.013", new_score: 0.9155, decision: "kept", ollama_model_used: "mmss-gemma4-q4:latest" },
  { round: 3, timestamp: "2025-01-15T10:07:30Z", asset: "mmss_specs/MMSS_META_SYNTHESIS_ULTIMATE_v1.0.json", asset_kind: "mmss_spec", change_description: "unified_metrics.coverage.current_value: 0.91 -> 0.93", new_score: 0.9234, decision: "kept", ollama_model_used: "mmss-gemma4-q4:latest" },
  { round: 4, timestamp: "2025-01-15T10:10:00Z", asset: "llm/prompts/work/mmss_evaluation.md", asset_kind: "prompt", change_description: "prompt_text: length 1870 -> 1920", new_score: 0.9198, decision: "reverted", ollama_model_used: null },
  { round: 5, timestamp: "2025-01-15T10:12:30Z", asset: "mmss_specs/MMSS_META_SYNTHESIS_ULTIMATE_v1.0.json", asset_kind: "mmss_spec", change_description: "unified_metrics.falsifiability.current_value: 0.72 -> 0.78", new_score: 0.9287, decision: "kept", ollama_model_used: "mmss-gemma4-q4:latest" },
];

export function AutoResearchPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(-1);
  const [baselineScore, setBaselineScore] = useState(0.8856);
  const [bestScore, setBestScore] = useState(0.8856);
  const [roundLogs, setRoundLogs] = useState<RoundLog[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const loopIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [config, setConfig] = useState<LoopConfig>({
    mode: "mmss",
    max_rounds: 12,
    target_score: 0.92,
    epsilon: 0.0005,
    stop_after_no_improve: 3,
    ollama_model: "mmss-gemma4-q4:latest",
    use_ollama: true,
    operation: "mmss_improve",
  });

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roundLogs]);

  const simulateLoopStep = useCallback(() => {
    setCurrentRound((prev) => {
      const round = prev + 1;
      if (round >= config.max_rounds) {
        setIsRunning(false);
        if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
        return prev;
      }

      const demoLog = demoLogs[round % demoLogs.length];
      const scoreJitter = (Math.random() - 0.4) * 0.01;
      const newScore = Math.min(0.999, Math.max(0.8, demoLog.new_score + scoreJitter + bestScore - 0.88));
      const decision: "kept" | "reverted" = newScore > bestScore + config.epsilon ? "kept" : "reverted";

      const logEntry: RoundLog = {
        ...demoLog,
        round,
        timestamp: new Date().toISOString(),
        new_score: parseFloat(newScore.toFixed(6)),
        decision,
      };

      setRoundLogs((prev) => [...prev, logEntry]);

      if (decision === "kept") {
        setBestScore(newScore);
      }

      if (newScore >= config.target_score) {
        setIsRunning(false);
        if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
      }

      return round;
    });
  }, [config.max_rounds, config.epsilon, config.target_score, bestScore]);

  const startLoop = () => {
    setIsRunning(true);
    setCurrentRound(-1);
    setRoundLogs([]);
    setBestScore(baselineScore);
    loopIntervalRef.current = setInterval(simulateLoopStep, 2500);
  };

  const stopLoop = () => {
    setIsRunning(false);
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
  };

  const scoreProgress = Math.min(100, (bestScore / config.target_score) * 100);

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔬</span>
          <div>
            <h2 className="text-sm font-semibold text-white">Auto Research</h2>
            <p className="text-[10px] text-[#8b949e]">MMSS Auto-Loop Engine</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] px-2 py-0.5 ${
            isRunning
              ? "border-yellow-500/50 text-yellow-400"
              : "border-emerald-500/50 text-emerald-400"
          }`}
        >
          {isRunning ? "Running" : "Stopped"}
        </Badge>
      </div>

      {/* Config Panel */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3 mb-3">
        <h3 className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2">Configuration</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between bg-[#0d1117] rounded-md px-2 py-1">
            <span className="text-[10px] text-[#8b949e]">Mode</span>
            <div className="flex gap-1">
              <button
                onClick={() => setConfig(p => ({ ...p, mode: "numeric" }))}
                className={`text-[9px] px-1.5 py-0.5 rounded ${config.mode === "numeric" ? "bg-[#1f6feb]/20 text-[#58a6ff]" : "text-[#8b949e]"}`}
              >
                numeric
              </button>
              <button
                onClick={() => setConfig(p => ({ ...p, mode: "mmss" }))}
                className={`text-[9px] px-1.5 py-0.5 rounded ${config.mode === "mmss" ? "bg-emerald-500/20 text-emerald-400" : "text-[#8b949e]"}`}
              >
                mmss
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between bg-[#0d1117] rounded-md px-2 py-1">
            <span className="text-[10px] text-[#8b949e]">Max Rounds</span>
            <span className="text-[11px] text-white font-mono">{config.max_rounds}</span>
          </div>
          <div className="flex items-center justify-between bg-[#0d1117] rounded-md px-2 py-1">
            <span className="text-[10px] text-[#8b949e]">Target Score</span>
            <span className="text-[11px] text-emerald-400 font-mono">{config.target_score}</span>
          </div>
          <div className="flex items-center justify-between bg-[#0d1117] rounded-md px-2 py-1">
            <span className="text-[10px] text-[#8b949e]">Epsilon</span>
            <span className="text-[11px] text-white font-mono">{config.epsilon}</span>
          </div>
          <div className="flex items-center justify-between bg-[#0d1117] rounded-md px-2 py-1">
            <span className="text-[10px] text-[#8b949e]">Stop After</span>
            <span className="text-[11px] text-white font-mono">{config.stop_after_no_improve} no improve</span>
          </div>
          <div className="flex items-center justify-between bg-[#0d1117] rounded-md px-2 py-1">
            <span className="text-[10px] text-[#8b949e]">Ollama</span>
            <span className={`text-[10px] font-mono ${config.use_ollama ? "text-emerald-400" : "text-[#8b949e]"}`}>
              {config.use_ollama ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </div>

      {/* Operation Selector */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3 mb-3">
        <h3 className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2">Operation</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {operations.map((op) => (
            <button
              key={op.value}
              onClick={() => setConfig(p => ({ ...p, operation: op.value as LoopConfig["operation"] }))}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] transition-all ${
                config.operation === op.value
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                  : "bg-[#0d1117] border border-[#30363d] text-[#8b949e] hover:border-[#484f58]"
              }`}
            >
              <span>{op.icon}</span>
              <div className="text-left">
                <div className="font-medium">{op.label}</div>
                <div className="text-[8px] text-[#8b949e]">{op.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Score Progress */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3 mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] text-[#8b949e]">Progress to Target</span>
          <span className="text-[12px] font-mono font-bold text-white">{bestScore.toFixed(4)} / {config.target_score}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#0d1117] mb-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${scoreProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#8b949e]">
          <span>Baseline: {baselineScore.toFixed(4)}</span>
          <span>Round: {currentRound >= 0 ? currentRound : "—"}/{config.max_rounds}</span>
          <span>Best: {bestScore.toFixed(4)}</span>
        </div>
      </div>

      {/* Start / Stop Buttons */}
      <div className="flex gap-2 mb-3">
        <Button
          onClick={startLoop}
          disabled={isRunning}
          size="sm"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7"
        >
          ▶ Start Loop
        </Button>
        <Button
          onClick={stopLoop}
          disabled={!isRunning}
          variant="outline"
          size="sm"
          className="flex-1 border-[#30363d] text-[#c9d1d9] text-[11px] h-7"
        >
          ■ Stop
        </Button>
      </div>

      <Separator className="bg-[#30363d] mb-3" />

      {/* Round Log */}
      <div className="flex-1 min-h-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider">Round Log</h3>
          <span className="text-[10px] text-[#8b949e]">{roundLogs.length} entries</span>
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {roundLogs.length === 0 && (
            <p className="text-[10px] text-[#8b949e] italic text-center py-4">Start the loop to see round history</p>
          )}
          {[...roundLogs].reverse().map((log) => (
            <div key={log.round} className="rounded-md bg-[#161b22] border border-[#30363d] p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#8b949e]">R{log.round}</span>
                  <Badge
                    variant="outline"
                    className={`text-[8px] px-1 py-0 ${
                      log.decision === "kept"
                        ? "border-emerald-500/50 text-emerald-400"
                        : "border-red-500/50 text-red-400"
                    }`}
                  >
                    {log.decision}
                  </Badge>
                  <Badge variant="outline" className="text-[8px] px-1 py-0 border-[#30363d] text-[#8b949e]">
                    {log.asset_kind}
                  </Badge>
                </div>
                <span className={`text-[11px] font-mono font-bold ${log.decision === "kept" ? "text-emerald-400" : "text-red-400"}`}>
                  {log.new_score.toFixed(6)}
                </span>
              </div>
              <p className="text-[9px] text-[#8b949e] font-mono truncate">{log.change_description}</p>
              {log.ollama_model_used && (
                <p className="text-[8px] text-cyan-400/60 mt-0.5">model: {log.ollama_model_used}</p>
              )}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
