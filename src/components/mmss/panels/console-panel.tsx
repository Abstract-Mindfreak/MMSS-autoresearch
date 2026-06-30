"use client"

import React, { useEffect, useRef, useState } from "react"

interface LogEntry {
  id: number
  timestamp: string
  level: "info" | "warn" | "error" | "success"
  source: string
  message: string
}

export function ConsolePanel() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [autoScroll, setAutoScroll] = useState(true)
  const [error, setError] = useState("")
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    const loadLogs = async () => {
      try {
        const response = await fetch("/api/system/logs")
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load logs")
        }
        if (!cancelled) {
          setLogs(
            (data ?? []).map(
              (
                log: Omit<LogEntry, "id"> & { id: string | number },
                index: number
              ) => ({
                id: typeof log.id === "number" ? log.id : index + 1,
                timestamp: new Date(log.timestamp).toLocaleTimeString(),
                level: log.level,
                source: log.source,
                message: log.message,
              })
            )
          )
          setError("")
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load logs")
        }
      }
    }

    void loadLogs()
    const interval = setInterval(() => {
      void loadLogs()
    }, 2500)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs, autoScroll])

  const levelColors = {
    info: "text-[#8b949e]",
    warn: "text-yellow-400",
    error: "text-red-400",
    success: "text-emerald-400",
  }

  const levelBg = {
    info: "",
    warn: "bg-yellow-500/5",
    error: "bg-red-500/5",
    success: "bg-emerald-500/5",
  }

  return (
    <div className="flex h-full flex-col bg-[#0d1117] text-[#c9d1d9]">
      <div className="shrink-0 border-b border-[#30363d] px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">LG</span>
            <h2 className="text-sm font-semibold text-white">Console</h2>
            <span className="text-[10px] text-[#8b949e]">{logs.length} entries</span>
          </div>
          <button
            onClick={() => setLogs([])}
            className="rounded px-2 py-1 text-[10px] text-[#8b949e] transition-colors hover:bg-[#161b22] hover:text-white"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px]">
        {error ? (
          <div className="mb-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
            {error}
          </div>
        ) : null}
        {logs.map((log) => (
          <div
            key={log.id}
            className={`flex items-start gap-2 rounded px-2 py-0.5 hover:bg-[#161b22] ${levelBg[log.level]}`}
          >
            <span className="w-16 shrink-0 text-[10px] text-[#8b949e]">
              {log.timestamp}
            </span>
            <span className={`w-10 shrink-0 font-bold uppercase ${levelColors[log.level]}`}>
              {log.level}
            </span>
            <span className="w-16 shrink-0 text-cyan-400">[{log.source}]</span>
            <span className="text-[#c9d1d9]">{log.message}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      <div className="shrink-0 border-t border-[#30363d] px-3 py-1">
        <label className="flex items-center gap-1.5 text-[10px] text-[#8b949e]">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded"
          />
          Auto-scroll
        </label>
      </div>
    </div>
  )
}
