import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { listModels } from "@/lib/ollama"

const FALLBACK_MODELS = [
  "mmss-gemma4-mmss-json:latest",
  "mmss-gemma4-q4:latest",
  "mmss-gemma4-q4-creative:latest",
  "embeddinggemma:300m",
  "qwen2.5-coder:3b",
  "qwen2.5-coder:7b",
]

export async function GET() {
  const config = await db.systemConfig.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  })

  try {
    const models = await listModels(config.ollamaBaseUrl)
    return NextResponse.json({
      models: Array.from(new Set([...FALLBACK_MODELS, ...models])),
      selected_model: config.ollamaModel,
      error: null,
    })
  } catch (error) {
    return NextResponse.json({
      models: FALLBACK_MODELS,
      selected_model: config.ollamaModel,
      error: error instanceof Error ? error.message : "Failed to load Ollama models",
    })
  }
}
