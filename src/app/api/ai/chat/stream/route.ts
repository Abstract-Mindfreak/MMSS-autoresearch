import { NextRequest } from "next/server"
import { TextEncoder } from "util"
import { db } from "@/lib/db"
import { createChatEventStream } from "@/lib/llm"

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const config = await db.systemConfig.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  })

  const prompt = String(payload.message ?? payload.user_query ?? "").trim()
  if (!prompt) {
    return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 })
  }

  const provider = config.aiProvider === "mistral" ? "mistral" : "ollama"
  const model = provider === "mistral" ? config.mistralModel : config.ollamaModel
  const upstream = await createChatEventStream(prompt, {
    provider,
    ollamaModel: config.ollamaModel,
    mistralModel: config.mistralModel,
    ollamaBaseUrl: config.ollamaBaseUrl,
    timeoutSeconds: config.ollamaTimeout,
  })
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader()
      const decoder = new TextDecoder()
      let fullText = ""
      let buffer = ""

      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          if (provider === "mistral") {
            fullText += buffer
            controller.enqueue(encoder.encode(buffer))
            buffer = ""
            continue
          }

          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue

            fullText += trimmed + "\n"
            controller.enqueue(encoder.encode(`data: ${trimmed}\n\n`))
          }
        }

        if (provider === "ollama" && buffer.trim()) {
          fullText += buffer.trim()
          controller.enqueue(encoder.encode(`data: ${buffer.trim()}\n\n`))
        }

        await db.chatMessage.createMany({
          data: [
            { role: "user", content: prompt, model, provider },
            { role: "assistant", content: fullText.trim(), model, provider },
          ],
        })
        controller.close()
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: error instanceof Error ? error.message : "Streaming failed" })}\n\n`
          )
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
