"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DOMAIN_PROFILES } from "@/lib/mmss/domains"

export function PromptGeneratorPanel() {
  const [config, setConfig] = useState({
    prompt_type: "full",
    domain: "MMSS",
    task_context: "",
    role_description: "",
    instructions: "",
    expected_result: "",
    ethical_constraints: "",
    export_format: "text",
    enable_pfr: true,
    enable_frp: true,
    enable_ammss: true,
    target_eta_r: true,
    target_value: true,
    target_coherence: true,
    target_cohesion: true,
  })
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")
  const [showConfig, setShowConfig] = useState(false)

  const generatePrompt = async () => {
    setIsGenerating(true)
    setGeneratedPrompt("")
    setError("")

    try {
      const response = await fetch("/api/mmss/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Prompt generation failed")
      }
      setGeneratedPrompt(data.prompt ?? "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prompt generation failed")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#0d1117] p-4 text-[#c9d1d9]">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">PR</span>
        <div>
          <h2 className="text-sm font-semibold text-white">Prompt Generator</h2>
          <p className="text-[10px] text-[#8b949e]">MMSS specialized prompt builder</p>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
        <div>
          <label className="mb-1 block text-[10px] text-[#8b949e]">Prompt Type</label>
          <select
            value={config.prompt_type}
            onChange={(e) => setConfig((prev) => ({ ...prev, prompt_type: e.target.value }))}
            className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1.5 text-[11px] text-white"
          >
            <option value="full">Full MMSS</option>
            <option value="pfr">PFR</option>
            <option value="frp">FRP</option>
            <option value="ammss">A-MMSS</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-[#8b949e]">Domain</label>
          <select
            value={config.domain}
            onChange={(e) => setConfig((prev) => ({ ...prev, domain: e.target.value }))}
            className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1.5 text-[11px] text-white"
          >
            {DOMAIN_PROFILES.map((domain) => (
              <option key={domain.name} value={domain.name}>
                {domain.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="mb-1 block text-[10px] text-[#8b949e]">Task Context</label>
          <Textarea
            value={config.task_context}
            onChange={(e) => setConfig((prev) => ({ ...prev, task_context: e.target.value }))}
            className="min-h-[88px] border-[#30363d] bg-[#0d1117] text-[11px] text-white"
          />
        </div>
        <div className="col-span-2">
          <label className="mb-1 block text-[10px] text-[#8b949e]">Role Description</label>
          <Textarea
            value={config.role_description}
            onChange={(e) => setConfig((prev) => ({ ...prev, role_description: e.target.value }))}
            className="min-h-[64px] border-[#30363d] bg-[#0d1117] text-[11px] text-white"
          />
        </div>
      </div>

      <div className="mb-3 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
          MMSS Components
        </h3>
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          {[
            ["enable_pfr", "PFR"],
            ["enable_frp", "FRP"],
            ["enable_ammss", "A-MMSS"],
            ["target_eta_r", "eta_R"],
            ["target_value", "V -> 1.0"],
            ["target_coherence", "Psi_ops"],
            ["target_cohesion", "Phi_cohesion"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-[#c9d1d9]">
              <input
                type="checkbox"
                checked={config[key as keyof typeof config] as boolean}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, [key]: e.target.checked }))
                }
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
        <div>
          <label className="mb-1 block text-[10px] text-[#8b949e]">Instructions</label>
          <Textarea
            value={config.instructions}
            onChange={(e) => setConfig((prev) => ({ ...prev, instructions: e.target.value }))}
            className="min-h-[72px] border-[#30363d] bg-[#0d1117] text-[11px] text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-[#8b949e]">Expected Result</label>
          <Textarea
            value={config.expected_result}
            onChange={(e) => setConfig((prev) => ({ ...prev, expected_result: e.target.value }))}
            className="min-h-[72px] border-[#30363d] bg-[#0d1117] text-[11px] text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-[#8b949e]">Ethical Constraints</label>
          <Textarea
            value={config.ethical_constraints}
            onChange={(e) => setConfig((prev) => ({ ...prev, ethical_constraints: e.target.value }))}
            className="min-h-[72px] border-[#30363d] bg-[#0d1117] text-[11px] text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-[#8b949e]">Export Format</label>
          <select
            value={config.export_format}
            onChange={(e) => setConfig((prev) => ({ ...prev, export_format: e.target.value }))}
            className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1.5 text-[11px] text-white"
          >
            <option value="text">Text</option>
            <option value="markdown">Markdown</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <Button
          onClick={() => void generatePrompt()}
          disabled={isGenerating}
          className="h-8 flex-1 bg-emerald-600 text-[12px] text-white hover:bg-emerald-700"
        >
          {isGenerating ? "Generating..." : "Generate Prompt"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-[#30363d] px-3 text-[11px] text-[#c9d1d9]"
          onClick={() => setShowConfig((prev) => !prev)}
        >
          👁
        </Button>
      </div>

      {error ? (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
          {error}
        </div>
      ) : null}

      {showConfig ? (
        <pre className="mb-4 whitespace-pre-wrap rounded-lg border border-[#30363d] bg-[#161b22] p-3 font-mono text-[10px] text-[#8b949e]">
          {JSON.stringify(config, null, 2)}
        </pre>
      ) : null}

      {generatedPrompt ? (
        <div className="flex-1 rounded-lg border border-[#30363d] bg-[#161b22] p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
              Generated Prompt
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-[#8b949e]"
              onClick={() => void navigator.clipboard.writeText(generatedPrompt)}
            >
              Copy
            </Button>
          </div>
          <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[#c9d1d9]">
            {generatedPrompt}
          </pre>
        </div>
      ) : null}
    </div>
  )
}
