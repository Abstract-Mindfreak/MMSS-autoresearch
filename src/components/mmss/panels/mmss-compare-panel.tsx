"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CompareModel {
  system_id: string
  evaluation: {
    coherence: number
    coverage: number
    reuse: number
    falsifiability: number
    overall: number
  }
}

const axes = ["coherence", "coverage", "reuse", "falsifiability", "overall"] as const

export function MMSSComparePanel() {
  const [models, setModels] = useState<CompareModel[]>([])
  const [modelA, setModelA] = useState("")
  const [modelB, setModelB] = useState("")
  const [verdict, setVerdict] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [metricComparison, setMetricComparison] = useState<Record<string, { a: number; b: number; delta: number }>>({})
  const [isComparing, setIsComparing] = useState(false)
  const [error, setError] = useState("")
  const [provider, setProvider] = useState<"ollama" | "mistral">("ollama")

  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch("/api/mmss/specs")
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load MMSS models")
        }

        const mapped = (data ?? []).map(
          (model: {
            systemId: string
            bestScore: number
            evaluations?: Array<{
              coherence: number
              coverage: number
              reuse: number
              falsifiability: number
              overall: number
            }>
          }) => ({
            system_id: model.systemId,
            evaluation: model.evaluations?.[0] ?? {
              coherence: model.bestScore,
              coverage: model.bestScore,
              reuse: model.bestScore,
              falsifiability: Math.max(0, model.bestScore - 0.1),
              overall: model.bestScore,
            },
          })
        )

        setModels(mapped)
        setModelA(mapped[0]?.system_id ?? "")
        setModelB(mapped[1]?.system_id ?? mapped[0]?.system_id ?? "")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load MMSS models")
      }
    }

    void loadModels()
  }, [])

  const a = useMemo(() => models.find((model) => model.system_id === modelA) ?? null, [modelA, models])
  const b = useMemo(() => models.find((model) => model.system_id === modelB) ?? null, [modelB, models])

  const handleCompare = async () => {
    setIsComparing(true)
    setVerdict(null)
    setAnalysis(null)
    setError("")

    try {
      const response = await fetch("/api/mmss/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemA: modelA, systemB: modelB, provider }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to compare MMSS models")
      }
      setVerdict(data.verdict ?? null)
      setAnalysis(data.analysis ?? null)
      setMetricComparison(data.metric_comparison ?? {})
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compare MMSS models")
    } finally {
      setIsComparing(false)
    }
  }

  const winner = useMemo(() => {
    if (!a || !b) return null
    if (a.evaluation.overall === b.evaluation.overall) return null
    return a.evaluation.overall > b.evaluation.overall ? a : b
  }, [a, b])

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#0d1117] p-4 text-[#c9d1d9]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
        <span className="text-lg">CP</span>
        <div>
          <h2 className="text-sm font-semibold text-white">MMSS Compare</h2>
          <p className="text-[10px] text-[#8b949e]">Side-by-Side Model Comparison</p>
        </div>
        </div>
        <div className="flex rounded-md border border-[#30363d] bg-[#161b22] p-0.5">
          {(["ollama", "mistral"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setProvider(value)}
              className={`rounded px-2 py-0.5 text-[9px] ${
                provider === value ? "bg-emerald-500/20 text-emerald-400" : "text-[#8b949e]"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
          {error}
        </div>
      ) : null}

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-2">
          <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
            Model A
          </label>
          <select
            value={modelA}
            onChange={(e) => setModelA(e.target.value)}
            className="w-full rounded-md border-[#30363d] bg-[#0d1117] px-1.5 py-1 text-[10px] text-[#c9d1d9]"
          >
            {models.map((model) => (
              <option key={model.system_id} value={model.system_id}>
                {model.system_id.split("_").slice(0, 4).join("_")} ({model.evaluation.overall.toFixed(3)})
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-2">
          <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-violet-400">
            Model B
          </label>
          <select
            value={modelB}
            onChange={(e) => setModelB(e.target.value)}
            className="w-full rounded-md border-[#30363d] bg-[#0d1117] px-1.5 py-1 text-[10px] text-[#c9d1d9]"
          >
            {models.map((model) => (
              <option key={model.system_id} value={model.system_id}>
                {model.system_id.split("_").slice(0, 4).join("_")} ({model.evaluation.overall.toFixed(3)})
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        onClick={() => void handleCompare()}
        disabled={isComparing || !modelA || !modelB || modelA === modelB}
        className="mb-3 h-7 w-full bg-cyan-600 text-[11px] text-white hover:bg-cyan-700"
      >
        {isComparing ? "Analyzing..." : modelA === modelB ? "Select different models" : "Run Comparison"}
      </Button>

      {a && b ? (
        <div className="mb-3 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[9px] text-emerald-400">
              A: {modelA.split("_").slice(0, 3).join("_")}
            </span>
            <span className="text-[11px] font-semibold text-white">Metric Comparison</span>
            <span className="font-mono text-[9px] text-violet-400">
              B: {modelB.split("_").slice(0, 3).join("_")}
            </span>
          </div>

          <div className="space-y-2">
            {axes.map((axis) => {
              const aVal = metricComparison[axis]?.a ?? a.evaluation[axis]
              const bVal = metricComparison[axis]?.b ?? b.evaluation[axis]
              const aIsBetter = aVal > bVal
              return (
                <div key={axis}>
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className={`font-mono text-[10px] font-bold ${aIsBetter ? "text-emerald-400" : "text-[#8b949e]"}`}>
                      {aVal.toFixed(2)}
                    </span>
                    <span className="text-[9px] uppercase text-[#8b949e]">{axis}</span>
                    <span className={`font-mono text-[10px] font-bold ${!aIsBetter && bVal !== aVal ? "text-violet-400" : "text-[#8b949e]"}`}>
                      {bVal.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative h-3 w-full rounded-full bg-[#0d1117]">
                    <div
                      className="absolute left-0 top-0 h-full rounded-l-full bg-emerald-500/60 transition-all duration-500"
                      style={{ width: `${aVal * 50}%` }}
                    />
                    <div
                      className="absolute right-0 top-0 h-full rounded-r-full bg-violet-500/60 transition-all duration-500"
                      style={{ width: `${bVal * 50}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {winner ? (
            <div className="mt-3 border-t border-[#30363d] pt-2 text-center">
              <span className="text-[10px] text-[#8b949e]">Winner: </span>
              <Badge
                variant="outline"
                className="border-emerald-500/50 px-2 py-0.5 text-[10px] text-emerald-400"
              >
                {winner.system_id.split("_").slice(0, 4).join("_")}
              </Badge>
              <span className="ml-1 text-[10px] text-[#8b949e]">
                ({winner.evaluation.overall.toFixed(4)})
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {verdict ? (
        <div className="rounded-lg border border-cyan-500/30 bg-[#161b22] p-3">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
            Verdict
          </h3>
          <p className="mb-2 text-[10px] leading-relaxed text-[#c9d1d9]">{verdict}</p>
          {analysis ? <p className="text-[10px] leading-relaxed text-[#8b949e]">{analysis}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
