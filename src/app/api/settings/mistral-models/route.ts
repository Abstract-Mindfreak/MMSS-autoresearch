import { NextResponse } from "next/server"
import { db } from "@/lib/db"

const FALLBACK_MODELS = [
  "mistral-small-latest",
  "mistral-medium-latest",
  "mistral-large-latest",
  "open-mistral-nemo",
  "codestral-latest",
]

async function listMistralModels() {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is not set")
  }

  const response = await fetch("https://api.mistral.ai/v1/models", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Failed to load Mistral models: ${response.status} ${details}`)
  }

  const payload = (await response.json()) as { data?: Array<{ id?: string }> }
  return (payload.data ?? []).map((entry) => entry.id).filter((id): id is string => Boolean(id))
}

export async function GET() {
  const config = await db.systemConfig.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  })

  try {
    const models = await listMistralModels()
    return NextResponse.json({
      models: Array.from(new Set([...FALLBACK_MODELS, ...models])),
      selected_model: config.mistralModel,
      error: null,
    })
  } catch (error) {
    return NextResponse.json({
      models: FALLBACK_MODELS,
      selected_model: config.mistralModel,
      error: error instanceof Error ? error.message : "Failed to load Mistral models",
    })
  }
}
