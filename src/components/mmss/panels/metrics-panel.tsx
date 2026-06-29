"use client";

import React, { useState, useEffect } from "react";

interface Metric {
  label: string;
  value: number;
  color: string;
  trend: "up" | "down" | "stable";
}

export function MetricsPanel() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: "PFR Efficiency (η_R)", value: 0.87, color: "#10b981", trend: "up" },
    { label: "FRP Stability", value: 0.72, color: "#06b6d4", trend: "stable" },
    { label: "A-MMSS Optimization", value: 0.85, color: "#8b5cf6", trend: "up" },
    { label: "Semantic Gravity (G_S)", value: 0.91, color: "#f59e0b", trend: "up" },
    { label: "Context Coherence", value: 0.68, color: "#10b981", trend: "down" },
    { label: "Ethical Score", value: 0.95, color: "#06b6d4", trend: "stable" },
    { label: "Pipeline Throughput", value: 0.78, color: "#8b5cf6", trend: "up" },
    { label: "Response Quality", value: 0.88, color: "#f59e0b", trend: "stable" },
  ]);

  // Simulate live metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => {
          const delta = (Math.random() - 0.45) * 0.03;
          const newVal = Math.max(0.1, Math.min(1.0, m.value + delta));
          const trend: "up" | "down" | "stable" =
            delta > 0.005 ? "up" : delta < -0.005 ? "down" : "stable";
          return { ...m, value: newVal, trend };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const trendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "↑";
      case "down":
        return "↓";
      case "stable":
        return "→";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        <div>
          <h2 className="text-sm font-semibold text-white">
            System Metrics
          </h2>
          <p className="text-[10px] text-[#8b949e]">Live Performance Monitor</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg bg-[#161b22] border border-[#30363d] p-2.5"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-[#8b949e] truncate max-w-[70%]">
                {metric.label}
              </span>
              <span
                className={`text-[10px] font-medium ${
                  metric.trend === "up"
                    ? "text-emerald-400"
                    : metric.trend === "down"
                    ? "text-red-400"
                    : "text-[#8b949e]"
                }`}
              >
                {trendIcon(metric.trend)}
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-white mb-1">
              {metric.value.toFixed(3)}
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#0d1117]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${metric.value * 100}%`,
                  backgroundColor: metric.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* System Overview */}
      <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3">
        <h3 className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
          System Overview
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8b949e]">Average Score</span>
            <span className="text-[12px] font-mono font-bold text-white">
              {(metrics.reduce((a, m) => a + m.value, 0) / metrics.length).toFixed(3)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8b949e]">Active Modules</span>
            <span className="text-[12px] font-mono text-emerald-400">3 / 3</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8b949e]">Pipeline Status</span>
            <span className="text-[12px] font-mono text-emerald-400">Running</span>
          </div>
        </div>
      </div>
    </div>
  );
}
