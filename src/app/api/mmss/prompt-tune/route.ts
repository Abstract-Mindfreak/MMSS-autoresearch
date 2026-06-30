import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { tunePromptTemplate } from "@/lib/mmss/ollama-ops"

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const config = await db.systemConfig.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  })

  const promptTemplate = String(
    payload.promptTemplate ??
      payload.currentPrompt ??
      "Return a structured MMSS response grounded in the selected system."
  )

  const tunedPrompt = await tunePromptTemplate({
    promptTemplate,
    topic: String(payload.topic ?? payload.domain ?? "general"),
    systemId: payload.systemId ? String(payload.systemId) : undefined,
    model: String(payload.model ?? config.ollamaModel),
    baseUrl: config.ollamaBaseUrl,
    timeout: config.ollamaTimeout,
    provider: payload.provider === "mistral" ? "mistral" : config.aiProvider === "mistral" ? "mistral" : "ollama",
    mistralModel: String(payload.mistralModel ?? config.mistralModel),
  })

  return NextResponse.json({
    prompt: tunedPrompt,
    model: String(payload.model ?? config.ollamaModel),
  })
}
