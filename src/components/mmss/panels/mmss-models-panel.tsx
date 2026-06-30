"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface MMSSModel {
  id: string
  system_id: string
  domain: string
  purpose: string
  best_score: number
  last_eval: string | null
  version: string
  evaluation: {
    coherence: number
    coverage: number
    reuse: number
    falsifiability: number
    overall: number
  } | null
}

const scoreColor = (score: number) => {
  if (score >= 0.9) return "text-emerald-400"
  if (score >= 0.7) return "text-yellow-400"
  return "text-red-400"
}

const scoreBarColor = (score: number) => {
  if (score >= 0.9) return "bg-emerald-500"
  if (score >= 0.7) return "bg-yellow-500"
  return "bg-red-500"
}

export function MMSSModelsPanel() {
  const [models, setModels] = useState<MMSSModel[]>([])
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [newTopicName, setNewTopicName] = useState("")
  const [showNewTopicForm, setShowNewTopicForm] = useState(false)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState("")
  const [provider, setProvider] = useState<"ollama" | "mistral">("ollama")

  const loadModels = async () => {
    try {
      const response = await fetch("/api/mmss/specs")
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load MMSS specs")
      }

      setModels(
        (data ?? []).map(
          (model: {
            id: string
            systemId: string
            domain: string
            purpose: string
            bestScore: number
            lastEval: string | null
            version: string
            evaluations?: Array<{
              coherence: number
              coverage: number
              reuse: number
              falsifiability: number
              overall: number
            }>
          }) => ({
            id: model.id,
            system_id: model.systemId,
            domain: model.domain,
            purpose: model.purpose,
            best_score: model.bestScore,
            last_eval: model.lastEval,
            version: model.version,
            evaluation: model.evaluations?.[0]
              ? {
                  coherence: model.evaluations[0].coherence,
                  coverage: model.evaluations[0].coverage,
                  reuse: model.evaluations[0].reuse,
                  falsifiability: model.evaluations[0].falsifiability,
                  overall: model.evaluations[0].overall,
                }
              : null,
          })
        )
      )
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load MMSS specs")
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadModels()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  const poolStats = useMemo(() => {
    if (models.length === 0) {
      return null
    }
    return {
      total: models.length,
      avgScore: models.reduce((sum, model) => sum + model.best_score, 0) / models.length,
      bestModel: models.reduce((best, model) =>
        model.best_score > best.best_score ? model : best
      ),
    }
  }, [models])

  const handleSingleImprove = async (systemId: string) => {
    setBusyId(systemId)
    try {
      const response = await fetch("/api/mmss/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemId, provider }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to improve MMSS model")
      }
      await loadModels()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to improve MMSS model")
    } finally {
      setBusyId("")
    }
  }

  const handleCloneToTopic = async () => {
    if (!newTopicName.trim() || models.length === 0) return
    setBusyId("clone")
    try {
      const response = await fetch("/api/mmss/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceSystemId: selectedModel ?? models[0]?.system_id,
          domain: newTopicName,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to clone MMSS model")
      }
      setNewTopicName("")
      setShowNewTopicForm(false)
      await loadModels()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clone MMSS model")
    } finally {
      setBusyId("")
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#0d1117] p-4 text-[#c9d1d9]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">MM</span>
          <div>
            <h2 className="text-sm font-semibold text-white">MMSS Models</h2>
            <p className="text-[10px] text-[#8b949e]">Fitness Landscape Pool</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          <Button
            size="sm"
            className="h-6 bg-violet-600 px-2 text-[10px] text-white hover:bg-violet-700"
            onClick={() => setShowNewTopicForm(!showNewTopicForm)}
          >
            + New from Topic
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
          {error}
        </div>
      ) : null}

      {showNewTopicForm ? (
        <div className="mb-3 rounded-lg border border-violet-500/30 bg-[#161b22] p-3">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-violet-400">
            Clone to New Topic
          </h3>
          <div className="flex gap-2">
            <Input
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Topic name..."
              className="h-7 flex-1 border-[#30363d] bg-[#0d1117] text-[11px] text-white"
            />
            <Button
              size="sm"
              onClick={() => void handleCloneToTopic()}
              disabled={!newTopicName.trim() || busyId === "clone"}
              className="h-7 bg-violet-600 text-[10px] text-white hover:bg-violet-700"
            >
              {busyId === "clone" ? "Cloning..." : "Clone"}
            </Button>
          </div>
        </div>
      ) : null}

      {poolStats ? (
        <div className="mb-3 rounded-lg border border-[#30363d] bg-[#161b22] p-2.5">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-mono text-lg font-bold text-white">{poolStats.total}</div>
              <div className="text-[9px] text-[#8b949e]">Total Models</div>
            </div>
            <div>
              <div className={`font-mono text-lg font-bold ${scoreColor(poolStats.avgScore)}`}>
                {poolStats.avgScore.toFixed(3)}
              </div>
              <div className="text-[9px] text-[#8b949e]">Avg Score</div>
            </div>
            <div>
              <div className="font-mono text-[10px] font-bold leading-tight text-emerald-400">
                {poolStats.bestModel.system_id.split("_").slice(0, 3).join("_")}
              </div>
              <div className="text-[9px] text-[#8b949e]">
                Best ({poolStats.bestModel.best_score.toFixed(3)})
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        {models.map((model) => (
          <div
            key={model.id}
            className="cursor-pointer rounded-lg border border-[#30363d] bg-[#161b22] p-3 transition-colors hover:border-emerald-500/30"
            onClick={() =>
              setSelectedModel(selectedModel === model.system_id ? null : model.system_id)
            }
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <Badge
                  variant="outline"
                  className="shrink-0 border-[#30363d] px-1.5 py-0 text-[8px] text-[#8b949e]"
                >
                  {model.domain}
                </Badge>
                <span className="truncate font-mono text-[11px] text-white">
                  {model.system_id}
                </span>
              </div>
              <span className={`font-mono text-sm font-bold ${scoreColor(model.best_score)}`}>
                {model.best_score.toFixed(3)}
              </span>
            </div>

            {model.evaluation ? (
              <div className="mb-2 grid grid-cols-4 gap-1">
                {(["coherence", "coverage", "reuse", "falsifiability"] as const).map((metric) => (
                  <div key={metric}>
                    <div className="mb-0.5 flex justify-between text-[8px] text-[#8b949e]">
                      <span>{metric.slice(0, 4)}</span>
                      <span className={scoreColor(model.evaluation?.[metric] ?? 0)}>
                        {model.evaluation?.[metric].toFixed(2)}
                      </span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-[#0d1117]">
                      <div
                        className={`h-full rounded-full ${scoreBarColor(model.evaluation?.[metric] ?? 0)}`}
                        style={{ width: `${(model.evaluation?.[metric] ?? 0) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <p className="line-clamp-1 text-[9px] text-[#8b949e]">{model.purpose}</p>

            {selectedModel === model.system_id ? (
              <div className="mt-2 border-t border-[#30363d] pt-2">
                <div className="mb-2 flex gap-2">
                  <Button
                    size="sm"
                    className="h-6 flex-1 bg-emerald-600 text-[10px] text-white hover:bg-emerald-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      void handleSingleImprove(model.system_id)
                    }}
                    disabled={busyId === model.system_id}
                  >
                    {busyId === model.system_id ? "Improving..." : "Improve"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 flex-1 border-[#30363d] text-[10px] text-[#c9d1d9]"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedModel(model.system_id)
                      setShowNewTopicForm(true)
                    }}
                  >
                    Clone
                  </Button>
                </div>
                <div className="rounded-md bg-[#0d1117] p-2">
                  <p className="text-[9px] text-[#8b949e]">
                    <span className="text-cyan-400">Version:</span> {model.version} |{" "}
                    <span className="text-cyan-400">Eval:</span>{" "}
                    {model.last_eval ? new Date(model.last_eval).toLocaleString() : "never"}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
