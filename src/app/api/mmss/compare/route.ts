import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { compareMMSSSpecs } from "@/lib/mmss/ollama-ops"

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const systemA = String(payload.systemA ?? payload.modelA ?? "").trim()
  const systemB = String(payload.systemB ?? payload.modelB ?? "").trim()

  if (!systemA || !systemB) {
    return NextResponse.json({ error: "Two MMSS systems are required" }, { status: 400 })
  }

  const [specA, specB] = await Promise.all([
    db.mMSSSpec.findUnique({
      where: { systemId: systemA },
      include: { evaluations: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    db.mMSSSpec.findUnique({
      where: { systemId: systemB },
      include: { evaluations: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
  ])

  if (!specA || !specB) {
    return NextResponse.json({ error: "One or both MMSS systems were not found" }, { status: 404 })
  }

  const config = await db.systemConfig.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  })

  const result = await compareMMSSSpecs({
    specA: specA.specJson,
    specB: specB.specJson,
    systemA: specA.systemId,
    systemB: specB.systemId,
    model: String(payload.model ?? config.ollamaModel),
    baseUrl: config.ollamaBaseUrl,
    timeout: config.ollamaTimeout,
    provider: payload.provider === "mistral" ? "mistral" : config.aiProvider === "mistral" ? "mistral" : "ollama",
    mistralModel: String(payload.mistralModel ?? config.mistralModel),
  })

  return NextResponse.json(result)
}
