import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chatText } from "@/lib/llm"

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const config = await db.systemConfig.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  })

  const userMessage = String(payload.message ?? payload.user_query ?? "").trim()
  if (!userMessage) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  const history = Array.isArray(payload.history) ? payload.history : []
  const response = await chatText([...history, { role: "user", content: userMessage }], {
    provider: config.aiProvider === "mistral" ? "mistral" : "ollama",
    ollamaModel: config.ollamaModel,
    mistralModel: config.mistralModel,
    ollamaBaseUrl: config.ollamaBaseUrl,
    timeoutSeconds: config.ollamaTimeout,
  })

  await db.chatMessage.createMany({
    data: [
      {
        role: "user",
        content: userMessage,
        model: config.aiProvider === "mistral" ? config.mistralModel : config.ollamaModel,
        provider: config.aiProvider,
      },
      {
        role: "assistant",
        content: response,
        model: config.aiProvider === "mistral" ? config.mistralModel : config.ollamaModel,
        provider: config.aiProvider,
      },
    ],
  })

  return NextResponse.json({
    response,
    model: config.aiProvider === "mistral" ? config.mistralModel : config.ollamaModel,
    provider: config.aiProvider,
  })
}
