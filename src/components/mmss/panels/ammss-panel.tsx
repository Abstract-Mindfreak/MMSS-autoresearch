"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AMMSSResult {
  status: string
  completion_condition_met: boolean
  W_context_2: number
  opt_A_MMSS: number
  metrics: {
    G_S_2: number
    V_2: number
    Cost_eth_2: number
    Phi_universal_cohesion: number
    absolute_contextuality: number
  }
  verification: {
    method: string
    success_criteria: string
    final_state: string
  }
}

export function AMMSSPanel() {
  const [isActive] = useState(true)
  const [result, setResult] = useState<AMMSSResult | null>(null)
  const [isWeaving, setIsWeaving] = useState(false)
  const [error, setError] = useState("")
  const [contextData, setContextData] = useState({
    R_T: 1.0,
    S_1_mean: 0.3,
    S_1_var: 0.05,
    beta: 0.5,
    Xi_topo_2: 0.95,
    N_2: 0.05,
    C_val_2: 0.1,
    Phi_meta_self: 1.0,
    lambda: 0.1,
    Cost_eth_1_sum: 0.8,
    Phi_fractal_field: 0.98,
    Psi_co_2: 0.95,
    resonance: 1.0,
    Phi_universal_cohesion: 0.98,
    absolute_contextuality: 0.95,
    S_2: 0.0,
  })

  const handleWeave = async () => {
    setIsWeaving(true)
    setError("")

    try {
      const response = await fetch("/api/mmss/ammss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contextData),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to run context weaving")
      }
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run context weaving")
    } finally {
      setIsWeaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#0d1117] p-4 text-[#c9d1d9]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">A-MMSS</span>
          <div>
            <h2 className="text-sm font-semibold text-white">A-MMSS - Context Weaver</h2>
            <p className="text-[10px] text-[#8b949e]">Second-order context weaving with ethical stabilization</p>
          </div>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${isActive ? "bg-violet-500/20 text-violet-400" : "bg-red-500/20 text-red-400"}`}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
        {Object.entries(contextData).map(([key, value]) => (
          <div key={key}>
            <label className="mb-1 block text-[10px] text-[#8b949e]">{key}</label>
            <Input
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setContextData((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
              className="h-8 border-[#30363d] bg-[#0d1117] text-[11px] text-white"
            />
          </div>
        ))}
      </div>

      <div className="mb-4 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">Formula</h3>
        <pre className="whitespace-pre-wrap rounded-md bg-[#0d1117] p-2 font-mono text-[10px] text-violet-400">
{`W_context^(2) = cut_fractal x sew_semantic + embed_ethical x loop_resonance
G_S^(2) = (1 / R_T^2) x (S_1_mean + beta x Var(S_1)) / (Xi_topo^(2) x (1 - N^(2))^2)`}
        </pre>
      </div>

      <Button
        onClick={() => void handleWeave()}
        disabled={isWeaving}
        className="mb-4 h-8 w-full bg-violet-600 text-[12px] text-white hover:bg-violet-700"
      >
        {isWeaving ? "Weaving Context..." : "Run Context Weaving"}
      </Button>

      {error ? (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-violet-500/30 bg-[#161b22] p-3">
              <div className="text-lg font-bold text-violet-400">{result.W_context_2.toFixed(4)}</div>
              <div className="text-[10px] text-[#8b949e]">W_context^(2)</div>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-[#161b22] p-3">
              <div className="text-lg font-bold text-emerald-400">{result.opt_A_MMSS.toFixed(4)}</div>
              <div className="text-[10px] text-[#8b949e]">opt_A-MMSS</div>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-[#161b22] p-3">
              <div className="text-lg font-bold text-amber-400">{result.metrics.V_2.toFixed(4)}</div>
              <div className="text-[10px] text-[#8b949e]">V^(2)</div>
            </div>
          </div>

          <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">Detailed Metrics</h3>
            <pre className="whitespace-pre-wrap font-mono text-[10px] text-[#c9d1d9]">
              {JSON.stringify(result.metrics, null, 2)}
            </pre>
          </div>

          <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-violet-400">Verification</h3>
            <pre className="whitespace-pre-wrap font-mono text-[10px] text-[#c9d1d9]">
              {JSON.stringify(result.verification, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  )
}
