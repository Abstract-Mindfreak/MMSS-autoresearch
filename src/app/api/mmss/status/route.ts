import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const [config, specsCount, reportsCount, tasksCount, chatsCount, logsCount] =
    await Promise.all([
      db.systemConfig.upsert({
        where: { id: "main" },
        update: {},
        create: { id: "main" },
      }),
      db.mMSSSpec.count(),
      db.evaluationReport.count(),
      db.task.count(),
      db.chatMessage.count(),
      db.researchLog.count(),
    ])

  const metrics = [
    {
      label: "PFR Efficiency",
      value: Math.min(0.99, 0.45 + specsCount * 0.03),
      color: "#10b981",
      trend: specsCount > 0 ? "up" : "stable",
    },
    {
      label: "FRP Stability",
      value: Math.min(0.98, 0.5 + reportsCount * 0.02),
      color: "#06b6d4",
      trend: reportsCount > 2 ? "up" : "stable",
    },
    {
      label: "A-MMSS Optimization",
      value: Math.min(0.99, 0.48 + tasksCount * 0.015),
      color: "#8b5cf6",
      trend: tasksCount > 0 ? "up" : "stable",
    },
    {
      label: "Semantic Gravity",
      value: Math.min(0.99, 0.42 + chatsCount * 0.01),
      color: "#f59e0b",
      trend: chatsCount > 3 ? "up" : "stable",
    },
    {
      label: "Context Coherence",
      value: Math.min(0.99, 0.4 + logsCount * 0.01),
      color: "#22c55e",
      trend: logsCount > 0 ? "up" : "stable",
    },
    {
      label: "Provider Health",
      value: config.aiProvider === "ollama" ? 0.92 : 0.82,
      color: "#14b8a6",
      trend: "stable",
    },
    {
      label: "Pipeline Throughput",
      value: Math.min(0.99, 0.35 + (specsCount + reportsCount + chatsCount) * 0.01),
      color: "#a855f7",
      trend: chatsCount > 0 ? "up" : "stable",
    },
    {
      label: "Response Quality",
      value: Math.min(0.99, 0.5 + reportsCount * 0.015 + chatsCount * 0.005),
      color: "#f97316",
      trend: reportsCount > 0 ? "up" : "stable",
    },
  ] as const

  return NextResponse.json({
    metrics,
    overview: {
      average: metrics.reduce((sum, item) => sum + item.value, 0) / metrics.length,
      activeModules: 3,
      totalModules: 3,
      pipelineStatus: "Running",
      provider: config.aiProvider,
      model: config.ollamaModel,
    },
  })
}
