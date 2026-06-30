import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { evaluateMMSSSpec, improveMMSSSpec } from "@/lib/mmss/ollama-ops"

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const systemId = String(payload.systemId ?? "").trim()

  if (!systemId) {
    return NextResponse.json({ error: "systemId is required" }, { status: 400 })
  }

  const spec = await db.mMSSSpec.findUnique({
    where: { systemId },
  })

  if (!spec) {
    return NextResponse.json({ error: "MMSS spec not found" }, { status: 404 })
  }

  const config = await db.systemConfig.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  })

  const baselineEvaluation = await evaluateMMSSSpec({
    specJson: spec.specJson,
    model: String(payload.model ?? config.ollamaModel),
    baseUrl: config.ollamaBaseUrl,
    timeout: config.ollamaTimeout,
    systemId: spec.systemId,
    provider: payload.provider === "mistral" ? "mistral" : config.aiProvider === "mistral" ? "mistral" : "ollama",
    mistralModel: String(payload.mistralModel ?? config.mistralModel),
  })

  const improvedSpecJson = await improveMMSSSpec({
    specJson: spec.specJson,
    evaluation: baselineEvaluation,
    model: String(payload.model ?? config.ollamaModel),
    baseUrl: config.ollamaBaseUrl,
    timeout: config.ollamaTimeout,
    targetTopic: payload.targetTopic ? String(payload.targetTopic) : undefined,
    provider: payload.provider === "mistral" ? "mistral" : config.aiProvider === "mistral" ? "mistral" : "ollama",
    mistralModel: String(payload.mistralModel ?? config.mistralModel),
  })

  const improvedEvaluation = await evaluateMMSSSpec({
    specJson: improvedSpecJson,
    model: String(payload.model ?? config.ollamaModel),
    baseUrl: config.ollamaBaseUrl,
    timeout: config.ollamaTimeout,
    systemId: spec.systemId,
    provider: payload.provider === "mistral" ? "mistral" : config.aiProvider === "mistral" ? "mistral" : "ollama",
    mistralModel: String(payload.mistralModel ?? config.mistralModel),
  })

  const updated = await db.mMSSSpec.update({
    where: { id: spec.id },
    data: {
      specJson: improvedSpecJson,
      bestScore: improvedEvaluation.overall,
      lastEval: new Date(),
    },
  })

  const report = await db.evaluationReport.create({
    data: {
      systemId: updated.systemId,
      mmssSpecId: updated.id,
      overall: improvedEvaluation.overall,
      coherence: improvedEvaluation.coherence,
      coverage: improvedEvaluation.coverage,
      reuse: improvedEvaluation.reuse,
      falsifiability: improvedEvaluation.falsifiability,
      verdict: improvedEvaluation.verdict,
      strengths: JSON.stringify(improvedEvaluation.strengths),
      weaknesses: JSON.stringify(improvedEvaluation.weaknesses),
      recommendations: JSON.stringify(improvedEvaluation.recommendations),
      rawLlmComment: improvedEvaluation.rawLlmComment,
      ollamaModelUsed: String(payload.model ?? config.ollamaModel),
    },
  })

  return NextResponse.json({
    spec: updated,
    report,
    baselineEvaluation,
    improvedEvaluation,
  })
}
