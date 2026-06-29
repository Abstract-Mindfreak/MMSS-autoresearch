"use client";

import React, { useState, useEffect, useRef } from "react";

interface LogEntry {
  id: number;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  source: string;
  message: string;
}

export function ConsolePanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const logMessages = [
    { level: "info", source: "Core", message: "MMSS System initialized successfully" },
    { level: "success", source: "PFR", message: "Fractal Reassembly Engine activated (η_R=0.87)" },
    { level: "success", source: "FRP", message: "Temporal Navigator online - ready for recursive scenarios" },
    { level: "success", source: "A-MMSS", message: "Context Weaver v2.0 initialized with ethical constraints" },
    { level: "info", source: "Orchestrator", message: "Pipeline configuration loaded from memory" },
    { level: "info", source: "AI", message: "Ollama connection established (mmss-gemma4-q4:latest)" },
    { level: "warn", source: "FRP", message: "Chaos level elevated to 0.8 - monitoring required" },
    { level: "info", source: "PFR", message: "Domain analysis completed: Financial Analysis (D_f=2.34)" },
    { level: "success", source: "A-MMSS", message: "Semantic gravity G_S^(2) calculated: 0.91" },
    { level: "info", source: "Orchestrator", message: "Auto cycle started - processing 6 agents" },
    { level: "info", source: "Game", message: "Game engine initialized - 3 modes available" },
    { level: "warn", source: "Core", message: "Memory usage at 72% - consider optimization" },
    { level: "info", source: "PFR", message: "Reassembly cycle 142 completed successfully" },
    { level: "error", source: "FRP", message: "Temporal mismatch at iteration 5 - auto-correcting" },
    { level: "success", source: "A-MMSS", message: "Context weaving cycle complete - contextuality: 0.95" },
    { level: "info", source: "AI", message: "Model inference completed (latency: 2.3s)" },
    { level: "success", source: "Orchestrator", message: "All agents completed - pipeline score: 0.88" },
    { level: "info", source: "Core", message: "System heartbeat: all modules responsive" },
  ];

  useEffect(() => {
    let id = 0;
    const addLog = () => {
      const msg = logMessages[id % logMessages.length];
      id++;
      setLogs((prev) => [
        ...prev.slice(-200), // Keep last 200 logs
        {
          id,
          timestamp: new Date().toLocaleTimeString(),
          level: msg.level,
          source: msg.source,
          message: msg.message,
        },
      ]);
    };

    // Add initial logs quickly
    for (let i = 0; i < 5; i++) {
      setTimeout(() => addLog(), i * 200);
    }

    // Then add logs periodically
    const interval = setInterval(() => {
      addLog();
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const levelColors = {
    info: "text-[#8b949e]",
    warn: "text-yellow-400",
    error: "text-red-400",
    success: "text-emerald-400",
  };

  const levelBg = {
    info: "",
    warn: "bg-yellow-500/5",
    error: "bg-red-500/5",
    success: "bg-emerald-500/5",
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h2 className="text-sm font-semibold text-white">Console</h2>
          <span className="text-[10px] text-[#8b949e]">
            {logs.length} entries
          </span>
        </div>
        <button
          onClick={() => setLogs([])}
          className="text-[10px] text-[#8b949e] hover:text-white transition-colors px-2 py-1 rounded hover:bg-[#161b22]"
        >
          Clear
        </button>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px]">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`flex items-start gap-2 px-2 py-0.5 hover:bg-[#161b22] rounded ${levelBg[log.level]}`}
          >
            <span className="text-[10px] text-[#8b949e] shrink-0 w-16">
              {log.timestamp}
            </span>
            <span className={`shrink-0 w-10 font-bold uppercase ${levelColors[log.level]}`}>
              {log.level}
            </span>
            <span className="shrink-0 text-cyan-400 w-16">[{log.source}]</span>
            <span className="text-[#c9d1d9]">{log.message}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      {/* Auto-scroll toggle */}
      <div className="border-t border-[#30363d] px-3 py-1 flex items-center justify-between shrink-0">
        <label className="flex items-center gap-1.5 text-[10px] text-[#8b949e]">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded"
          />
          Auto-scroll
        </label>
      </div>
    </div>
  );
}
