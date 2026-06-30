"use client"

import React, { useEffect, useMemo, useState } from "react"

interface MMSSReport {
  id: string
  system_id: string
  timestamp: string
  evaluation: {
    coherence: number
    coverage: number
    reuse: number
    falsifiability: number
    overall: number
  }
  verdict: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  raw_llm_commentary: string
}

const scoreColor = (score: number) =>
  score >= 0.9 ? "text-emerald-400" : score >= 0.7 ? "text-yellow-400" : "text-red-400"

const scoreBarColor = (score: number) =>
  score >= 0.9 ? "bg-emerald-500" : score >= 0.7 ? "bg-yellow-500" : "bg-red-500"

export function MMSSReportsPanel() {
  const [reports, setReports] = useState<MMSSReport[]>([])
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [filterModel, setFilterModel] = useState<string>("all")
  const [error, setError] = useState("")

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await fetch("/api/mmss/evaluate")
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load MMSS reports")
        }
        setReports(data ?? [])
        setExpandedReport(data?.[0]?.id ?? null)
        setError("")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load MMSS reports")
      }
    }

    void loadReports()
  }, [])

  const filtered = useMemo(
    () => (filterModel === "all" ? reports : reports.filter((report) => report.system_id === filterModel)),
    [filterModel, reports]
  )
  const modelIds = useMemo(() => [...new Set(reports.map((report) => report.system_id))], [reports])

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#0d1117] p-4 text-[#c9d1d9]">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">RP</span>
        <div>
          <h2 className="text-sm font-semibold text-white">MMSS Reports</h2>
          <p className="text-[10px] text-[#8b949e]">Evaluation Reports</p>
        </div>
      </div>

      {error ? (
        <div className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
          {error}
        </div>
      ) : null}

      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterModel("all")}
          className={`shrink-0 rounded-md px-2 py-1 text-[9px] transition-colors ${
            filterModel === "all"
              ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
              : "border border-[#30363d] bg-[#161b22] text-[#8b949e]"
          }`}
        >
          All ({reports.length})
        </button>
        {modelIds.map((id) => {
          const shortId = id.split("_").slice(0, 3).join("_")
          const count = reports.filter((report) => report.system_id === id).length
          return (
            <button
              key={id}
              onClick={() => setFilterModel(id)}
              className={`shrink-0 rounded-md px-2 py-1 text-[9px] transition-colors ${
                filterModel === id
                  ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                  : "border border-[#30363d] bg-[#161b22] text-[#8b949e]"
              }`}
            >
              {shortId} ({count})
            </button>
          )
        })}
      </div>

      <div className="space-y-2">
        {filtered.map((report) => (
          <div key={report.id} className="overflow-hidden rounded-lg border border-[#30363d] bg-[#161b22]">
            <div
              className="cursor-pointer px-3 py-2 transition-colors hover:bg-[#1c2129]"
              onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`font-mono text-sm font-bold ${scoreColor(report.evaluation.overall)}`}>
                    {report.evaluation.overall.toFixed(3)}
                  </span>
                  <span className="truncate font-mono text-[10px] text-[#8b949e]">
                    {report.system_id.split("_").slice(0, 4).join("_")}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="text-[9px] text-[#8b949e]">
                    {new Date(report.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-[8px] text-[#8b949e]">
                    {expandedReport === report.id ? "v" : ">"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {(["coherence", "coverage", "reuse", "falsifiability"] as const).map((metric) => (
                  <div key={metric}>
                    <div className="h-1 w-full rounded-full bg-[#0d1117]">
                      <div
                        className={`h-full rounded-full ${scoreBarColor(report.evaluation[metric])}`}
                        style={{ width: `${report.evaluation[metric] * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {expandedReport === report.id ? (
              <div className="border-t border-[#30363d] px-3 pb-3">
                <div className="mb-2 mt-2">
                  <p className="text-[10px] leading-relaxed text-[#c9d1d9]">{report.verdict}</p>
                </div>

                <div className="mb-2 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                      Strengths
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {report.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-1 text-[9px] text-[#8b949e]">
                          <span className="mt-0.5 text-emerald-400">+</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-red-400">
                      Weaknesses
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {report.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-1 text-[9px] text-[#8b949e]">
                          <span className="mt-0.5 text-red-400">-</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-cyan-400">
                    Recommendations
                  </span>
                  <ul className="mt-1 space-y-0.5">
                    {report.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-1 text-[9px] text-[#8b949e]">
                        <span className="mt-0.5 text-cyan-400">{"->"}</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <details className="group">
                  <summary className="cursor-pointer text-[9px] text-violet-400 hover:text-violet-300">
                    Raw LLM Commentary
                  </summary>
                  <p className="mt-1 rounded-md bg-[#0d1117] p-2 font-mono text-[9px] leading-relaxed text-[#8b949e]">
                    {report.raw_llm_commentary || "No commentary stored."}
                  </p>
                </details>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
