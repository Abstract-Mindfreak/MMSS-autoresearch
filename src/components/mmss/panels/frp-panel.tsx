"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FRPResult {
  status: string
  scenario_type: string
  fidelity: number
  operations?: Record<string, unknown>
  summary: string
}

export function FRPPanel() {
  const [isActive] = useState(true)
  const [result, setResult] = useState<FRPResult | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [error, setError] = useState("")
  const [scenarioParams, setScenarioParams] = useState({
    chaos_level: 0.8,
    plot_loss: true,
    scenario_signature: "recursive_dream_loop_001",
    iteration_index: 5,
    previous_iteration: 4,
    emotional_state: "strong",
    intention: "continue",
  })

  const handleNavigate = async () => {
    setIsNavigating(true)
    setError("")

    try {
      const response = await fetch("/api/mmss/frp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scenarioParams),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to navigate scenario")
      }
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to navigate scenario")
    } finally {
      setIsNavigating(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#0d1117] p-4 text-[#c9d1d9]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">FRP</span>
          <div>
            <h2 className="text-sm font-semibold text-white">FRP - Recursive Temporal Navigator</h2>
            <p className="text-[10px] text-[#8b949e]">Recursive temporal operators and scenario fidelity</p>
          </div>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${isActive ? "bg-cyan-500/20 text-cyan-400" : "bg-red-500/20 text-red-400"}`}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
        <div>
          <label className="mb-1 block text-[10px] text-[#8b949e]">Scenario Signature</label>
          <Input
            value={scenarioParams.scenario_signature}
            onChange={(e) => setScenarioParams((prev) => ({ ...prev, scenario_signature: e.target.value }))}
            className="h-8 border-[#30363d] bg-[#0d1117] text-[11px] text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-[#8b949e]">Intention</label>
          <Input
            value={scenarioParams.intention}
            onChange={(e) => setScenarioParams((prev) => ({ ...prev, intention: e.target.value }))}
            className="h-8 border-[#30363d] bg-[#0d1117] text-[11px] text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-[#8b949e]">Chaos Level</label>
          <Input
            type="number"
            step="0.1"
            value={scenarioParams.chaos_level}
            onChange={(e) => setScenarioParams((prev) => ({ ...prev, chaos_level: Number(e.target.value) }))}
            className="h-8 border-[#30363d] bg-[#0d1117] text-[11px] text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-[#8b949e]">Emotional State</label>
          <select
            value={scenarioParams.emotional_state}
            onChange={(e) => setScenarioParams((prev) => ({ ...prev, emotional_state: e.target.value }))}
            className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1.5 text-[11px] text-white"
          >
            <option value="">None</option>
            <option value="calm">Calm</option>
            <option value="moderate">Moderate</option>
            <option value="strong">Strong</option>
            <option value="intense">Intense</option>
            <option value="certain">Certain</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-[#8b949e]">Iteration Index</label>
          <Input
            type="number"
            value={scenarioParams.iteration_index}
            onChange={(e) => setScenarioParams((prev) => ({ ...prev, iteration_index: Number(e.target.value) }))}
            className="h-8 border-[#30363d] bg-[#0d1117] text-[11px] text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-[#8b949e]">Previous Iteration</label>
          <Input
            type="number"
            value={scenarioParams.previous_iteration}
            onChange={(e) => setScenarioParams((prev) => ({ ...prev, previous_iteration: Number(e.target.value) }))}
            className="h-8 border-[#30363d] bg-[#0d1117] text-[11px] text-white"
          />
        </div>
        <label className="col-span-2 flex items-center gap-2 text-[11px] text-[#c9d1d9]">
          <input
            type="checkbox"
            checked={scenarioParams.plot_loss}
            onChange={(e) => setScenarioParams((prev) => ({ ...prev, plot_loss: e.target.checked }))}
          />
          Plot loss
        </label>
      </div>

      <Button
        onClick={() => void handleNavigate()}
        disabled={isNavigating}
        className="mb-4 h-8 w-full bg-cyan-600 text-[12px] text-white hover:bg-cyan-700"
      >
        {isNavigating ? "Navigating..." : "Start Temporal Navigation"}
      </Button>

      {error ? (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-cyan-500/30 bg-[#161b22] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8b949e]">Status</span>
              <span className="text-sm font-semibold text-cyan-400">{result.status}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-[#8b949e]">Scenario Type</span>
              <span className="font-mono text-[11px] text-white">{result.scenario_type}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-[#8b949e]">Fidelity</span>
              <span className="font-mono text-[11px] text-white">{result.fidelity.toFixed(4)}</span>
            </div>
          </div>

          <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">Operations</h3>
            <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap font-mono text-[10px] text-[#c9d1d9]">
              {JSON.stringify(result.operations, null, 2)}
            </pre>
          </div>

          <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Summary</h3>
            <p className="text-[11px] leading-relaxed text-[#c9d1d9]">{result.summary}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
