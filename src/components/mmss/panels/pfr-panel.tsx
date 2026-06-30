"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DOMAIN_PROFILES, getDomainSubdomains } from "@/lib/mmss/domains"

interface ReassemblyResult {
  eta_R: number
  V_applied: number
  G_S: number
  reorganized_complexity: number
  D_f: number
  disintegration_index: number
  coherent_assembly: number
}

export function PFRPanel() {
  const [domain, setDomain] = useState("Financial Analysis")
  const [isActive] = useState(true)
  const [result, setResult] = useState<ReassemblyResult | null>(null)
  const [isComputing, setIsComputing] = useState(false)
  const [error, setError] = useState("")
  const [subdomain, setSubdomain] = useState("")

  const [parameters, setParameters] = useState({
    area: 1.0,
    S: 0.8,
    Xi_topo: 0.9,
    W: 0.95,
    Psi_opt: 0.9,
    delta_V: 0.6,
    delta_S: 0.4,
    cost: 1.2,
    R_T: 1.618,
  })

  const subdomains = getDomainSubdomains(domain)

  const handleReassembly = async () => {
    setIsComputing(true)
    setError("")

    try {
      const response = await fetch("/api/mmss/pfr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain,
          params: parameters,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to run PFR cycle")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run PFR cycle")
    } finally {
      setIsComputing(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#0d1117] p-4 text-[#c9d1d9]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">PFR</span>
          <div>
            <h2 className="text-sm font-semibold text-white">
              PFR - Practical Fractal Reassembly
            </h2>
            <p className="text-[10px] text-[#8b949e]">
              Fractal Reassembly Engine v1.0
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            isActive
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mb-4">
        <Label className="mb-1.5 block text-[11px] text-[#8b949e]">
          Target Domain
        </Label>
        <select
          value={domain}
          onChange={(e) => {
            setDomain(e.target.value)
            setSubdomain("")
          }}
          className="h-8 w-full rounded-md border border-[#30363d] bg-[#161b22] px-2 text-sm text-white"
        >
          {DOMAIN_PROFILES.map((entry) => (
            <option key={entry.name} value={entry.name}>
              {entry.name}
            </option>
          ))}
        </select>
      </div>

      {subdomains.length > 0 ? (
        <div className="mb-4">
          <Label className="mb-1.5 block text-[11px] text-[#8b949e]">Subdomain</Label>
          <select
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            className="h-8 w-full rounded-md border border-[#30363d] bg-[#161b22] px-2 text-sm text-white"
          >
            <option value="">General</option>
            {subdomains.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="mb-4 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
          Parameters
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(parameters).map(([key, value]) => (
            <div key={key}>
              <span className="mb-1 block font-mono text-[10px] text-[#8b949e]">{key}</span>
              <Input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setParameters((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                className="h-8 border-[#30363d] bg-[#0d1117] text-[11px] text-white"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
          Formula
        </h3>
        <div className="rounded-md bg-[#0d1117] p-2 font-mono text-[11px] text-emerald-400">
          eta_R = (deltaV / deltaS_reorganized) x (G_S / cost_complexity)
        </div>
      </div>

      <Button
        onClick={handleReassembly}
        disabled={isComputing}
        className="mb-4 h-8 w-full bg-emerald-600 text-[12px] text-white hover:bg-emerald-700"
      >
        {isComputing ? "Computing..." : "Run Full Reassembly Cycle"}
      </Button>

      {error ? (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="rounded-lg border border-emerald-500/30 bg-[#161b22] p-3">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Results
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8b949e]">
                Reassembly Efficiency
              </span>
              <span className="text-sm font-bold text-emerald-400">
                {result.eta_R.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8b949e]">Applied Value</span>
              <span className="font-mono text-sm text-white">
                {result.V_applied.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8b949e]">Semantic Gravity</span>
              <span className="font-mono text-sm text-white">
                {result.G_S.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8b949e]">
                Reorganized Complexity
              </span>
              <span className="font-mono text-sm text-white">
                {result.reorganized_complexity.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8b949e]">D_f</span>
              <span className="font-mono text-sm text-white">{result.D_f.toFixed(3)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8b949e]">Disintegration Index</span>
              <span className="font-mono text-sm text-white">{result.disintegration_index.toFixed(3)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8b949e]">Coherent Assembly</span>
              <span className="font-mono text-sm text-white">{result.coherent_assembly.toFixed(3)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
