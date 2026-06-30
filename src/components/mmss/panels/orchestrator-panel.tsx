"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Layout, Model, type IJsonModel, type TabNode } from "flexlayout-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ORCHESTRATOR_AGENTS } from "@/lib/mmss/orchestrator"

interface AgentState {
  id: string
  name: string
  operator: string
  role: string
  outputType: string
  status: "idle" | "processing" | "done" | "error"
  output: string
  prompt: string
}

interface SavedSession {
  id: string
  title: string
  createdAt: string
  provider: "ollama" | "mistral"
  ollamaModel: string
  mistralModel: string
  question: string
  agents: AgentState[]
}

const innerModelJson: IJsonModel = {
  global: {
    tabEnableClose: false,
    tabSetEnableMaximize: true,
  },
  borders: [],
  layout: {
    type: "row",
    children: [
      { type: "tabset", weight: 34, children: [{ type: "tab", component: "control", name: "Control" }] },
      { type: "tabset", weight: 42, children: [{ type: "tab", component: "agents", name: "Agents" }] },
      { type: "tabset", weight: 24, children: [{ type: "tab", component: "session", name: "Session" }] },
    ],
  },
}

const symbols: Record<string, string> = {
  QUANTUM_MAP: "↦ₚ",
  META_DERIVATION: "⊢ᵠ",
  FRACTAL_ENTAILMENT: "⇛ᶠ",
  TEMPORAL_GENERATION: "⧴ᵗ",
  GOLDEN_DERIVATION: "⊢ᵍ",
  CORRECTION_ENHANCED: "↦ᶜ",
  MULTYFUNCTIONAL_SUMMARY_WRITER_OBSIDIAN: "📝",
  OBSIDIAN_NODEFLOW_EXPORTER: "📊",
  ULTRA_CONCISE_LINKED_SUMMARY: "🔗",
  OMNIAGENT_UNIFIED_SYNTHESIZER: "🌀",
}

const types: Record<string, string> = {
  MULTYFUNCTIONAL_SUMMARY_WRITER_OBSIDIAN: "dataview md",
  OBSIDIAN_NODEFLOW_EXPORTER: "nodeflow-list",
  ULTRA_CONCISE_LINKED_SUMMARY: "linked-summary",
  OMNIAGENT_UNIFIED_SYNTHESIZER: "unified-omni",
  QUANTUM_MAP: "markdown",
  META_DERIVATION: "markdown",
  FRACTAL_ENTAILMENT: "markdown",
  TEMPORAL_GENERATION: "markdown",
  GOLDEN_DERIVATION: "markdown",
  CORRECTION_ENHANCED: "markdown",
}

const statusColors = {
  idle: "bg-[#8b949e]",
  processing: "bg-yellow-500 animate-pulse",
  done: "bg-emerald-500",
  error: "bg-red-500",
}

function initialAgents(): AgentState[] {
  return ORCHESTRATOR_AGENTS.map((agent) => ({
    id: agent.id,
    name: agent.name,
    operator: symbols[agent.name] ?? agent.operator,
    role: agent.purpose,
    outputType: types[agent.name] ?? "markdown",
    status: "idle",
    output: "",
    prompt: "",
  }))
}

export function OrchestratorPanel() {
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = window.localStorage.getItem("mmss-orchestrator-sessions")
      if (!raw) return []
      const parsed = JSON.parse(raw) as SavedSession[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [agents, setAgents] = useState<AgentState[]>(() => initialAgents())
  const [question, setQuestion] = useState("Analyze this MMSS request and coordinate the full pipeline.")
  const [provider, setProvider] = useState<"ollama" | "mistral">("ollama")
  const [ollamaModel, setOllamaModel] = useState("mmss-gemma4-q4:latest")
  const [mistralModel, setMistralModel] = useState("mistral-small-latest")
  const [ollamaModels, setOllamaModels] = useState<string[]>([])
  const [mistralModels, setMistralModels] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState("")
  const [sessionLog, setSessionLog] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState("")
  const [selectedSessionId, setSelectedSessionId] = useState("")
  const controlRef = useRef({ stopped: false, paused: false })

  const innerModel = useMemo(() => Model.fromJson(innerModelJson), [])

  async function refreshOllamaModels() {
    const response = await fetch("/api/settings/ollama-models")
    const data = await response.json()
    const models = Array.isArray(data.models) ? data.models.map(String) : []
    setOllamaModels(models)
    if (models.length > 0 && !models.includes(ollamaModel)) {
      setOllamaModel(models[0])
    }
  }

  async function refreshMistralModels() {
    const response = await fetch("/api/settings/mistral-models")
    const data = await response.json()
    const models = Array.isArray(data.models) ? data.models.map(String) : []
    setMistralModels(models)
    if (models.length > 0 && !models.includes(mistralModel)) {
      setMistralModel(models[0])
    }
  }

  const loadSessions = () => {
    try {
      const raw = window.localStorage.getItem("mmss-orchestrator-sessions")
      if (!raw) return
      const parsed = JSON.parse(raw) as SavedSession[]
      setSavedSessions(Array.isArray(parsed) ? parsed : [])
    } catch {
      // Ignore local storage parsing errors.
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshOllamaModels()
      void refreshMistralModels()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  const persistSession = () => {
    const nextSession: SavedSession = {
      id: selectedSessionId || `orchestrator-${Date.now()}`,
      title: question.slice(0, 60) || "MMSS Orchestrator Session",
      createdAt: new Date().toISOString(),
      provider,
      ollamaModel,
      mistralModel,
      question,
      agents,
    }
    const merged = [nextSession, ...savedSessions.filter((session) => session.id !== nextSession.id)].slice(0, 20)
    window.localStorage.setItem("mmss-orchestrator-sessions", JSON.stringify(merged))
    setSavedSessions(merged)
    setSelectedSessionId(nextSession.id)
  }

  const loadSession = (sessionId: string) => {
    setSelectedSessionId(sessionId)
    const match = savedSessions.find((session) => session.id === sessionId)
    if (!match) return
    setProvider(match.provider)
    setOllamaModel(match.ollamaModel)
    setMistralModel(match.mistralModel)
    setQuestion(match.question)
    setAgents(match.agents)
  }

  const downloadSession = () => {
    const payload = {
      provider,
      ollamaModel,
      mistralModel,
      question,
      agents,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "mmss-orchestrator-session.json"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const applyProviderSettings = async () => {
    await fetch("/api/settings/provider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    })
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ollamaModel, mistralModel }),
    })
  }

  const runSelectedAgents = async (agentIds: string[], promptQuestion = question, append = false) => {
    await applyProviderSettings()
    const response = await fetch("/api/orchestrator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: promptQuestion, agentIds }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error ?? "Failed to run orchestrator")
    }

    setAgents((prev) =>
      prev.map((agent) => {
        const match = (data.outputs ?? []).find(
          (entry: { agent?: { id?: string; name?: string }; output?: string; prompt?: string }) =>
            entry.agent?.id === agent.id || entry.agent?.name === agent.name
        )
        if (!match) return agent
        return {
          ...agent,
          status: "done",
          output: append && agent.output ? `${agent.output}\n\n${match.output ?? ""}` : match.output ?? "",
          prompt: match.prompt ?? agent.prompt,
        }
      })
    )
    setSessionLog((prev) => `${prev}\n${new Date().toLocaleTimeString()} | Completed ${agentIds.join(", ")}`.trim())
  }

  const runSingleAgent = async (agentId: string, promptQuestion = question) => {
    setError("")
    setIsRunning(true)
    setAgents((prev) => prev.map((agent) => agent.id === agentId ? { ...agent, status: "processing" } : agent))
    try {
      await runSelectedAgents([agentId], promptQuestion)
      persistSession()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to run agent"
      setError(message)
      setAgents((prev) => prev.map((agent) => agent.id === agentId ? { ...agent, status: "error", output: message } : agent))
    } finally {
      setIsRunning(false)
    }
  }

  const runAutoCycle = async () => {
    controlRef.current = { stopped: false, paused: false }
    setIsPaused(false)
    setIsRunning(true)
    setError("")
    setSessionLog("Auto cycle started")
    setAgents(initialAgents())
    try {
      for (const agent of ORCHESTRATOR_AGENTS) {
        if (controlRef.current.stopped) break
        setAgents((prev) => prev.map((entry) => entry.id === agent.id ? { ...entry, status: "processing" } : entry))
        while (controlRef.current.paused && !controlRef.current.stopped) {
          await new Promise((resolve) => setTimeout(resolve, 250))
        }
        if (controlRef.current.stopped) break
        await runSelectedAgents([agent.id], question)
      }
      persistSession()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto cycle failed")
    } finally {
      setIsRunning(false)
    }
  }

  const createSummary = async () => {
    const source = agents.filter((agent) => agent.output).map((agent) => `[${agent.name}]\n${agent.output}`).join("\n\n")
    if (!source) return
    const summaryQuestion = `Create a unified synthesis from these agent outputs:\n\n${source}`
    setQuestion(summaryQuestion)
    await runSingleAgent("omni_synthesizer", summaryQuestion)
  }

  const pauseCycle = () => {
    controlRef.current.paused = !controlRef.current.paused
    setIsPaused(controlRef.current.paused)
  }

  const stopCycle = () => {
    controlRef.current.stopped = true
    controlRef.current.paused = false
    setIsPaused(false)
    setIsRunning(false)
    setSessionLog((prev) => `${prev}\n${new Date().toLocaleTimeString()} | Stopped by user`.trim())
  }

  const factory = (node: TabNode) => {
    const component = node.getComponent()

    if (component === "control") {
      return (
        <div className="flex h-full flex-col overflow-y-auto bg-[#0d1117] p-3 text-[#c9d1d9]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">MMSS Orchestrator</h2>
              <p className="text-[10px] text-[#8b949e]">Sequential cycle, model switching, session control</p>
            </div>
            <Badge variant="outline" className="border-cyan-500/40 text-[9px] text-cyan-400">
              {provider}
            </Badge>
          </div>

          <div className="mb-3 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
            <div className="mb-2 grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] text-[#8b949e]">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as "ollama" | "mistral")}
                  className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1.5 text-[11px] text-white"
                >
                  <option value="ollama">Local Ollama</option>
                  <option value="mistral">Mistral</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-[#8b949e]">Ollama Model</label>
                <div className="flex gap-2">
                  <select
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1.5 text-[11px] text-white"
                  >
                    {(ollamaModels.length > 0 ? ollamaModels : [ollamaModel]).map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <Button size="sm" variant="outline" className="h-8 border-[#30363d] px-2 text-[10px]" onClick={() => void refreshOllamaModels()}>
                    Refresh
                  </Button>
                </div>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-[10px] text-[#8b949e]">Mistral Model</label>
                <div className="flex gap-2">
                  <select
                    value={mistralModel}
                    onChange={(e) => setMistralModel(e.target.value)}
                    className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1.5 text-[11px] text-white"
                  >
                    {(mistralModels.length > 0 ? mistralModels : [mistralModel]).map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <Button size="sm" variant="outline" className="h-8 border-[#30363d] px-2 text-[10px]" onClick={() => void refreshMistralModels()}>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
            <label className="mb-2 block text-[10px] text-[#8b949e]">Question</label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[120px] border-[#30363d] bg-[#0d1117] text-[11px] text-white"
            />
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <Button className="h-8 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700" disabled={isRunning || !question.trim()} onClick={() => void runAutoCycle()}>
              Auto Cycle
            </Button>
            <Button className="h-8 bg-cyan-600 text-[11px] text-white hover:bg-cyan-700" disabled={isRunning} onClick={() => void createSummary()}>
              Create Summary
            </Button>
            <Button variant="outline" className="h-8 border-[#30363d] text-[11px]" disabled={!isRunning} onClick={pauseCycle}>
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button variant="outline" className="h-8 border-[#30363d] text-[11px]" disabled={!isRunning} onClick={stopCycle}>
              Stop
            </Button>
            <Button variant="outline" className="h-8 border-[#30363d] text-[11px]" onClick={persistSession}>
              Save Session
            </Button>
            <Button variant="outline" className="h-8 border-[#30363d] text-[11px]" onClick={downloadSession}>
              Download
            </Button>
          </div>

          <div className="mb-3 flex gap-2">
            <select
              value={selectedSessionId}
              onChange={(e) => loadSession(e.target.value)}
              className="w-full rounded-md border border-[#30363d] bg-[#161b22] px-2 py-1.5 text-[11px] text-white"
            >
              <option value="">Saved sessions</option>
              {savedSessions.map((session) => (
                <option key={session.id} value={session.id}>{session.title}</option>
              ))}
            </select>
            <Button variant="outline" className="h-8 border-[#30363d] text-[11px]" onClick={loadSessions}>
              Reload
            </Button>
          </div>

          {error ? <div className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">{error}</div> : null}

          <pre className="flex-1 whitespace-pre-wrap rounded-lg border border-[#30363d] bg-[#161b22] p-3 font-mono text-[10px] text-[#8b949e]">
            {sessionLog || "Idle"}
          </pre>
        </div>
      )
    }

    if (component === "agents") {
      return (
        <div className="grid h-full grid-cols-2 gap-2 overflow-y-auto bg-[#0d1117] p-3">
          {agents.map((agent) => (
            <div key={agent.id} className="flex min-h-[220px] flex-col rounded-lg border border-[#30363d] bg-[#161b22] p-3 text-[#c9d1d9]">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${statusColors[agent.status]}`} />
                  <span className="font-mono text-[11px] text-white">{agent.name}</span>
                </div>
                <span className="text-[10px] text-cyan-400">{agent.operator}</span>
              </div>
              <div className="mb-2 flex items-center justify-between text-[10px] text-[#8b949e]">
                <span>{agent.role}</span>
                <span>{agent.outputType}</span>
              </div>
              <div className="mb-2 flex gap-2">
                <Button size="sm" className="h-7 flex-1 bg-emerald-600 text-[10px] text-white hover:bg-emerald-700" disabled={isRunning} onClick={() => void runSingleAgent(agent.id)}>
                  Run
                </Button>
                <Button size="sm" variant="outline" className="h-7 border-[#30363d] px-2 text-[10px]" onClick={stopCycle}>
                  Cancel
                </Button>
                <Button size="sm" variant="outline" className="h-7 border-[#30363d] px-2 text-[10px]" onClick={() => setSelectedPrompt(agent.prompt || `Question:\n${question}`)}>
                  👁
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto rounded-md bg-[#0d1117] p-2">
                <p className="whitespace-pre-wrap text-[10px] leading-relaxed text-[#c9d1d9]">
                  {agent.output || (agent.status === "processing" ? "Processing..." : "Awaiting activation...")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="flex h-full flex-col overflow-y-auto bg-[#0d1117] p-3 text-[#c9d1d9]">
        <div className="mb-3 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">Prompt Preview</h3>
          <pre className="max-h-[220px] overflow-y-auto whitespace-pre-wrap rounded-md bg-[#0d1117] p-2 font-mono text-[10px] text-[#8b949e]">
            {selectedPrompt || "Select 👁 on an agent card to inspect the exact prompt before send."}
          </pre>
        </div>
        <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">Session Snapshot</h3>
          <pre className="max-h-[420px] overflow-y-auto whitespace-pre-wrap rounded-md bg-[#0d1117] p-2 font-mono text-[10px] text-[#8b949e]">
            {JSON.stringify({ provider, ollamaModel, mistralModel, question, agents }, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#0d1117]">
      <Layout model={innerModel} factory={factory} className="h-full" />
    </div>
  )
}
