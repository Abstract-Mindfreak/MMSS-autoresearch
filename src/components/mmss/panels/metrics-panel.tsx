"use client"

import React, { useEffect, useState } from "react"

interface Metric {
  label: string
  value: number
  color: string
  trend: "up" | "down" | "stable"
}

interface Overview {
  average: number
  activeModules: number
  totalModules: number
  pipelineStatus: string
}

export function MetricsPanel() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [overview, setOverview] = useState<Overview>({
    average: 0,
    activeModules: 0,
    totalModules: 0,
    pipelineStatus: "Loading",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    const loadMetrics = async () => {
      try {
        const response = await fetch("/api/mmss/status")
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load metrics")
        }
        if (!cancelled) {
          setMetrics(data.metrics ?? [])
          setOverview(
            data.overview ?? {
              average: 0,
              activeModules: 0,
              totalModules: 0,
              pipelineStatus: "Loading",
            }
          )
          setError("")
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load metrics")
        }
      }
    }

    void loadMetrics()
    const interval = setInterval(() => {
      void loadMetrics()
    }, 3000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const trendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "^"
      case "down":
        return "v"
      case "stable":
        return "-"
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#0d1117] p-4 text-[#c9d1d9]">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">MT</span>
        <div>
          <h2 className="text-sm font-semibold text-white">System Metrics</h2>
          <p className="text-[10px] text-[#8b949e]">Live Performance Monitor</p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
          {error}
        </div>
      ) : null}

      <div className="mb-4 grid grid-cols-2 gap-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-[#30363d] bg-[#161b22] p-2.5"
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="max-w-[70%] truncate text-[10px] text-[#8b949e]">
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
            <div className="mb-1 text-lg font-bold text-white">
              {metric.value.toFixed(3)}
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#0d1117]">
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

      <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
          System Overview
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8b949e]">Average Score</span>
            <span className="font-mono text-[12px] font-bold text-white">
              {overview.average.toFixed(3)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8b949e]">Active Modules</span>
            <span className="font-mono text-[12px] text-emerald-400">
              {overview.activeModules} / {overview.totalModules}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8b949e]">Pipeline Status</span>
            <span className="font-mono text-[12px] text-emerald-400">
              {overview.pipelineStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
