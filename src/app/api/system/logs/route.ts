import { NextResponse } from "next/server"
import { db } from "@/lib/db"

type LogLevel = "info" | "warn" | "error" | "success"

function inferLevel(text: string): LogLevel {
  const lower = text.toLowerCase()
  if (lower.includes("error") || lower.includes("failed") || lower.includes("timeout")) {
    return "error"
  }
  if (lower.includes("warn") || lower.includes("fallback")) {
    return "warn"
  }
  if (lower.includes("done") || lower.includes("success") || lower.includes("completed")) {
    return "success"
  }
  return "info"
}

export async function GET() {
  const [chatMessages, researchLogs] = await Promise.all([
    db.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.researchLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ])

  const logs = [
    ...chatMessages.map((message) => ({
      id: message.id,
      timestamp: message.createdAt.toISOString(),
      level: inferLevel(message.content),
      source: message.role === "assistant" ? "AI" : "Chat",
      message: `${message.role}: ${message.content.slice(0, 180)}`,
    })),
    ...researchLogs.map((log) => ({
      id: log.id,
      timestamp: log.createdAt.toISOString(),
      level: log.decision === "kept" ? "success" as const : "warn" as const,
      source: "Research",
      message: `Round ${log.round} ${log.operation} on ${log.assetKind}: ${log.changeDescription}`,
    })),
  ].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))

  return NextResponse.json(logs.slice(0, 100))
}
