"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

interface RoundLog {
  round: number
  timestamp: string
  asset: string
  asset_kind: string
  change_description: string
  new_score: number
  decision: "kept" | "reverted"
  ollama_model_used: string | null
}

interface LoopConfig {
  mode: "numeric" | "mmss"
  max_rounds: number
  target_score: number
  epsilon: number
  stop_after_no_improve: number
  ollama_model: string
  use_ollama: boolean
  operation: "mmss_improve" | "mmss_clone_to_new_topic" | "mmss_compare" | "mmss_prompt_tune"
  selectedSystemId?: string
  compareSystemId?: string
  topic?: string
  provider?: "ollama" | "mistral"
  mistral_model?: string
}

interface LoopState {
  running: boolean
  runId: string | null
  currentRound: number
  baselineScore: number
  bestScore: number
  noImproveCount: number
  config: LoopConfig | null
  logs: RoundLog[]
  message: string
  startedAt: string | null
  finishedAt: string | null
  runs?: ResearchRun[]
  promptArtifacts?: PromptArtifact[]
}

interface MMSSOption {
  systemId: string
  domain: string
}

interface ResearchRun {
  id: string
  status: string
  operation: string
  provider: string
  model: string | null
  selectedSystemId: string | null
  compareSystemId: string | null
  topic: string | null
  currentRound: number
  maxRounds: number
  baselineScore: number
  bestScore: number
  message: string
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
}

interface PromptArtifact {
  id: string
  title: string
  systemId: string | null
  topic: string | null
  provider: string
  model: string | null
  createdAt: string
}

const operations = [
  { value: "mmss_improve", label: "Improve MMSS", icon: "IM", desc: "Improve existing MMSS via loop" },
  { value: "mmss_clone_to_new_topic", label: "Clone to Topic", icon: "CL", desc: "Clone MMSS to new domain" },
  { value: "mmss_compare", label: "Compare Two", icon: "CP", desc: "Compare two MMSS models" },
  { value: "mmss_prompt_tune", label: "Prompt Tune", icon: "PT", desc: "Tune MMSS-specific prompts" },
]

export function AutoResearchPanel() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentRound, setCurrentRound] = useState(-1)
  const [baselineScore, setBaselineScore] = useState(0.8856)
  const [bestScore, setBestScore] = useState(0.8856)
  const [roundLogs, setRoundLogs] = useState<RoundLog[]>([])
  const [runs, setRuns] = useState<ResearchRun[]>([])
  const [promptArtifacts, setPromptArtifacts] = useState<PromptArtifact[]>([])
  const [error, setError] = useState("")
  const [message, setMessage] = useState("idle")
  const [systems, setSystems] = useState<MMSSOption[]>([])
  const [ollamaModels, setOllamaModels] = useState<string[]>([])
  const [mistralModels, setMistralModels] = useState<string[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  const [config, setConfig] = useState<LoopConfig>({
    mode: "mmss",
    max_rounds: 12,
    target_score: 0.92,
    epsilon: 0.0005,
    stop_after_no_improve: 3,
    ollama_model: "mmss-gemma4-q4:latest",
    use_ollama: true,
    operation: "mmss_improve",
    selectedSystemId: "",
    compareSystemId: "",
    topic: "",
    provider: "ollama",
    mistral_model: "mistral-small-latest",
  })

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [roundLogs])

  useEffect(() => {
    const loadOllamaModels = async () => {
      try {
        const response = await fetch("/api/settings/ollama-models")
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load Ollama models")
        }
        const models = Array.isArray(data.models) ? data.models.map(String) : []
        setOllamaModels(models)
        setConfig((prev) => ({
          ...prev,
          ollama_model: models.includes(prev.ollama_model) ? prev.ollama_model : models[0] ?? prev.ollama_model,
        }))
      } catch {
        // Keep configured value if model discovery is unavailable.
      }
    }

    const loadMistralModels = async () => {
      try {
        const response = await fetch("/api/settings/mistral-models")
        const data = await response.json()
        const models = Array.isArray(data.models) ? data.models.map(String) : []
        setMistralModels(models)
        setConfig((prev) => ({
          ...prev,
          mistral_model: models.includes(prev.mistral_model ?? "") ? prev.mistral_model : models[0] ?? prev.mistral_model,
        }))
      } catch {
        // Keep configured value if model discovery is unavailable.
      }
    }

    const loadSystems = async () => {
      try {
        const response = await fetch("/api/mmss/specs")
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load MMSS systems")
        }
        const mapped = (data ?? []).map((item: { systemId: string; domain: string }) => ({
          systemId: item.systemId,
          domain: item.domain,
        }))
        setSystems(mapped)
        setConfig((prev) => ({
          ...prev,
          selectedSystemId: prev.selectedSystemId || mapped[0]?.systemId || "",
          compareSystemId: prev.compareSystemId || mapped[1]?.systemId || mapped[0]?.systemId || "",
          topic: prev.topic || mapped[0]?.domain || "",
        }))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load MMSS systems")
      }
    }

    void loadOllamaModels()
    void loadMistralModels()
    void loadSystems()
  }, [])

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        const response = await fetch("/api/research/loop")
        const data = (await response.json()) as LoopState
        if (!response.ok) {
          throw new Error("Failed to load loop state")
        }

        if (!cancelled) {
          setIsRunning(data.running)
          setCurrentRound(data.currentRound)
          setBaselineScore(data.baselineScore)
          setBestScore(data.bestScore)
          setRoundLogs(data.logs ?? [])
          setRuns(data.runs ?? [])
          setPromptArtifacts(data.promptArtifacts ?? [])
          setMessage(data.message)
          if (data.config) {
            setConfig(data.config)
          }
          setError("")
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load loop state")
        }
      }
    }

    void poll()
    const interval = window.setInterval(() => {
      void poll()
    }, 1200)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  const startLoop = async () => {
    try {
      setError("")
      const response = await fetch("/api/research/loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      const data = (await response.json()) as LoopState
      if (!response.ok) {
        throw new Error("Failed to start loop")
      }
      setIsRunning(data.running)
      setCurrentRound(data.currentRound)
      setBaselineScore(data.baselineScore)
      setBestScore(data.bestScore)
      setRoundLogs(data.logs ?? [])
      setMessage(data.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start loop")
    }
  }

  const controlRun = async (action: "resume" | "replay", runId: string) => {
    try {
      setError("")
      const response = await fetch("/api/research/loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, runId }),
      })
      const data = (await response.json()) as LoopState
      if (!response.ok) {
        throw new Error(`Failed to ${action} loop`)
      }
      setIsRunning(data.running)
      setCurrentRound(data.currentRound)
      setBaselineScore(data.baselineScore)
      setBestScore(data.bestScore)
      setRoundLogs(data.logs ?? [])
      setMessage(data.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} loop`)
    }
  }

  const stopLoop = async () => {
    try {
      setError("")
      const response = await fetch("/api/research/loop", {
        method: "DELETE",
      })
      const data = (await response.json()) as LoopState
      if (!response.ok) {
        throw new Error("Failed to stop loop")
      }
      setIsRunning(data.running)
      setMessage(data.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop loop")
    }
  }

  const scoreProgress = Math.min(100, (bestScore / Math.max(config.target_score, 0.0001)) * 100)

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#0d1117] p-4 text-[#c9d1d9]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">AR</span>
          <div>
            <h2 className="text-sm font-semibold text-white">Auto Research</h2>
            <p className="text-[10px] text-[#8b949e]">MMSS Auto-Loop Engine</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`px-2 py-0.5 text-[10px] ${
            isRunning
              ? "border-yellow-500/50 text-yellow-400"
              : "border-emerald-500/50 text-emerald-400"
          }`}
        >
          {isRunning ? "Running" : "Stopped"}
        </Badge>
      </div>

      {error ? (
        <div className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
          {error}
        </div>
      ) : null}

      <div className="mb-3 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
          Configuration
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-[#0d1117] px-2 py-1">
            <span className="mb-1 block text-[10px] text-[#8b949e]">Provider</span>
            <div className="flex gap-1">
              {(["ollama", "mistral"] as const).map((provider) => (
                <button
                  key={provider}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      provider,
                      use_ollama: provider === "ollama",
                    }))
                  }
                  className={`rounded px-2 py-1 text-[9px] ${
                    config.provider === provider
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-[#8b949e]"
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md bg-[#0d1117] px-2 py-1">
            <span className="text-[10px] text-[#8b949e]">Mode</span>
            <div className="flex gap-1">
              <button
                onClick={() => setConfig((p) => ({ ...p, mode: "numeric" }))}
                className={`rounded px-1.5 py-0.5 text-[9px] ${config.mode === "numeric" ? "bg-[#1f6feb]/20 text-[#58a6ff]" : "text-[#8b949e]"}`}
              >
                numeric
              </button>
              <button
                onClick={() => setConfig((p) => ({ ...p, mode: "mmss" }))}
                className={`rounded px-1.5 py-0.5 text-[9px] ${config.mode === "mmss" ? "bg-emerald-500/20 text-emerald-400" : "text-[#8b949e]"}`}
              >
                mmss
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md bg-[#0d1117] px-2 py-1">
            <span className="text-[10px] text-[#8b949e]">Max Rounds</span>
            <span className="font-mono text-[11px] text-white">{config.max_rounds}</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-[#0d1117] px-2 py-1">
            <span className="text-[10px] text-[#8b949e]">Target Score</span>
            <span className="font-mono text-[11px] text-emerald-400">{config.target_score}</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-[#0d1117] px-2 py-1">
            <span className="text-[10px] text-[#8b949e]">Epsilon</span>
            <span className="font-mono text-[11px] text-white">{config.epsilon}</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-[#0d1117] px-2 py-1">
            <span className="text-[10px] text-[#8b949e]">Stop After</span>
            <span className="font-mono text-[11px] text-white">{config.stop_after_no_improve}</span>
          </div>
          <div className="rounded-md bg-[#0d1117] px-2 py-1">
            <span className="mb-1 block text-[10px] text-[#8b949e]">Ollama Model</span>
            <div className="flex gap-2">
              <select
                value={config.ollama_model}
                onChange={(e) => setConfig((prev) => ({ ...prev, ollama_model: e.target.value }))}
                className="w-full rounded-md border-[#30363d] bg-[#0d1117] px-0 py-1 text-[10px] text-emerald-400"
              >
                {(ollamaModels.length > 0 ? ollamaModels : [config.ollama_model]).map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="outline"
                className="h-7 border-[#30363d] px-2 text-[10px]"
                onClick={() => void fetch("/api/settings/ollama-models").then((res) => res.json()).then((data) => setOllamaModels(Array.isArray(data.models) ? data.models.map(String) : []))}
              >
                Refresh
              </Button>
            </div>
          </div>
          <div className="rounded-md bg-[#0d1117] px-2 py-1">
            <span className="mb-1 block text-[10px] text-[#8b949e]">Mistral Model</span>
            <div className="flex gap-2">
              <select
                value={config.mistral_model}
                onChange={(e) => setConfig((prev) => ({ ...prev, mistral_model: e.target.value }))}
                className="w-full rounded-md border-[#30363d] bg-[#0d1117] px-0 py-1 text-[10px] text-cyan-400"
              >
                {(mistralModels.length > 0 ? mistralModels : [config.mistral_model ?? "mistral-small-latest"]).map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="outline"
                className="h-7 border-[#30363d] px-2 text-[10px]"
                onClick={() => void fetch("/api/settings/mistral-models").then((res) => res.json()).then((data) => setMistralModels(Array.isArray(data.models) ? data.models.map(String) : []))}
              >
                Refresh
              </Button>
            </div>
          </div>
          <div className="rounded-md bg-[#0d1117] px-2 py-1">
            <span className="mb-1 block text-[10px] text-[#8b949e]">Primary MMSS</span>
            <select
              value={config.selectedSystemId}
              onChange={(e) => setConfig((prev) => ({ ...prev, selectedSystemId: e.target.value }))}
              className="w-full rounded-md border-[#30363d] bg-[#0d1117] px-0 py-1 text-[10px] text-white"
            >
              {systems.map((system) => (
                <option key={system.systemId} value={system.systemId}>
                  {system.systemId}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-md bg-[#0d1117] px-2 py-1">
            <span className="mb-1 block text-[10px] text-[#8b949e]">Compare MMSS</span>
            <select
              value={config.compareSystemId}
              onChange={(e) => setConfig((prev) => ({ ...prev, compareSystemId: e.target.value }))}
              className="w-full rounded-md border-[#30363d] bg-[#0d1117] px-0 py-1 text-[10px] text-white"
            >
              {systems.map((system) => (
                <option key={system.systemId} value={system.systemId}>
                  {system.systemId}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-2">
          <span className="mb-1 block text-[10px] text-[#8b949e]">Target Topic</span>
          <Input
            value={config.topic ?? ""}
            onChange={(e) => setConfig((prev) => ({ ...prev, topic: e.target.value }))}
            className="h-8 border-[#30363d] bg-[#0d1117] text-[11px] text-white"
            placeholder="Topic or domain for improve/clone/prompt tune"
          />
        </div>
      </div>

      <div className="mb-3 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
          Operation
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {operations.map((op) => (
            <button
              key={op.value}
              onClick={() => setConfig((p) => ({ ...p, operation: op.value as LoopConfig["operation"] }))}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] transition-all ${
                config.operation === op.value
                  ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                  : "border border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-[#484f58]"
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

      <div className="mb-3 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] text-[#8b949e]">Progress to Target</span>
          <span className="font-mono text-[12px] font-bold text-white">
            {bestScore.toFixed(4)} / {config.target_score}
          </span>
        </div>
        <div className="mb-2 h-2 w-full rounded-full bg-[#0d1117]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${scoreProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#8b949e]">
          <span>Baseline: {baselineScore.toFixed(4)}</span>
          <span>
            Round: {currentRound >= 0 ? currentRound : "-"} / {config.max_rounds}
          </span>
          <span>Best: {bestScore.toFixed(4)}</span>
        </div>
        <div className="mt-2 text-[10px] text-cyan-400">{message}</div>
      </div>

      <div className="mb-3 flex gap-2">
        <Button
          onClick={() => void startLoop()}
          disabled={isRunning}
          size="sm"
          className="h-7 flex-1 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700"
        >
          Start Loop
        </Button>
        <Button
          onClick={() => void stopLoop()}
          disabled={!isRunning}
          variant="outline"
          size="sm"
          className="h-7 flex-1 border-[#30363d] text-[11px] text-[#c9d1d9]"
        >
          Stop
        </Button>
      </div>

      <Separator className="mb-3 bg-[#30363d]" />

      <div className="mb-3 min-h-0">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
            Run History
          </h3>
          <span className="text-[10px] text-[#8b949e]">{runs.length} runs</span>
        </div>
        <div className="max-h-36 space-y-1.5 overflow-y-auto">
          {runs.map((run) => (
            <div key={run.id} className="rounded-md border border-[#30363d] bg-[#161b22] p-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-[#30363d] px-1 py-0 text-[8px] text-[#8b949e]">
                    {run.operation}
                  </Badge>
                  <Badge variant="outline" className="border-cyan-500/40 px-1 py-0 text-[8px] text-cyan-400">
                    {run.provider}
                  </Badge>
                </div>
                <span className="font-mono text-[10px] text-white">{run.bestScore.toFixed(4)}</span>
              </div>
              <p className="truncate text-[10px] text-[#8b949e]">
                {run.selectedSystemId ?? "-"} | {run.topic ?? "-"} | {run.status}
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void controlRun("resume", run.id)}
                  disabled={isRunning || run.status === "running" || run.status === "completed"}
                  className="h-6 border-[#30363d] px-2 text-[10px] text-[#c9d1d9]"
                >
                  Resume
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void controlRun("replay", run.id)}
                  disabled={isRunning}
                  className="h-6 border-[#30363d] px-2 text-[10px] text-[#c9d1d9]"
                >
                  Replay
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3 min-h-0">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
            Prompt Artifacts
          </h3>
          <span className="text-[10px] text-[#8b949e]">{promptArtifacts.length} items</span>
        </div>
        <div className="max-h-32 space-y-1.5 overflow-y-auto">
          {promptArtifacts.map((artifact) => (
            <div key={artifact.id} className="rounded-md border border-[#30363d] bg-[#161b22] p-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-[10px] font-medium text-white">{artifact.title}</span>
                <Badge variant="outline" className="border-cyan-500/40 px-1 py-0 text-[8px] text-cyan-400">
                  {artifact.provider}
                </Badge>
              </div>
              <p className="truncate text-[9px] text-[#8b949e]">
                {artifact.systemId ?? "-"} | {artifact.topic ?? "-"} | {artifact.model ?? "-"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Separator className="mb-3 bg-[#30363d]" />

      <div className="min-h-0 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
            Round Log
          </h3>
          <span className="text-[10px] text-[#8b949e]">{roundLogs.length} entries</span>
        </div>
        <div className="max-h-48 space-y-1.5 overflow-y-auto">
          {roundLogs.length === 0 ? (
            <p className="py-4 text-center text-[10px] italic text-[#8b949e]">
              Start the loop to see round history
            </p>
          ) : null}
          {[...roundLogs].reverse().map((log) => (
            <div key={`${log.round}-${log.timestamp}`} className="rounded-md border border-[#30363d] bg-[#161b22] p-2">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#8b949e]">R{log.round}</span>
                  <Badge
                    variant="outline"
                    className={`px-1 py-0 text-[8px] ${
                      log.decision === "kept"
                        ? "border-emerald-500/50 text-emerald-400"
                        : "border-red-500/50 text-red-400"
                    }`}
                  >
                    {log.decision}
                  </Badge>
                  <Badge variant="outline" className="border-[#30363d] px-1 py-0 text-[8px] text-[#8b949e]">
                    {log.asset_kind}
                  </Badge>
                </div>
                <span className={`font-mono text-[11px] font-bold ${log.decision === "kept" ? "text-emerald-400" : "text-red-400"}`}>
                  {log.new_score.toFixed(6)}
                </span>
              </div>
              <p className="truncate font-mono text-[9px] text-[#8b949e]">{log.change_description}</p>
              {log.ollama_model_used ? (
                <p className="mt-0.5 text-[8px] text-cyan-400/60">model: {log.ollama_model_used}</p>
              ) : null}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  )
}
