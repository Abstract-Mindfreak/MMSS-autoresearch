import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { evaluateMMSSSpec } from "@/lib/mmss/ollama-ops"

function parseStringArray(value: string) {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return value ? [value] : []
  }
}

export async function GET() {
  const reports = await db.evaluationReport.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      mmssSpec: true,
    },
  })

  return NextResponse.json(
    reports.map((report) => ({
      id: report.id,
      system_id: report.systemId,
      timestamp: report.createdAt.toISOString(),
      evaluation: {
        coherence: report.coherence,
        coverage: report.coverage,
        reuse: report.reuse,
        falsifiability: report.falsifiability,
        overall: report.overall,
      },
      verdict: report.verdict,
      strengths: parseStringArray(report.strengths),
      weaknesses: parseStringArray(report.weaknesses),
      recommendations: parseStringArray(report.recommendations),
      raw_llm_commentary: report.rawLlmComment ?? "",
      model_title: report.mmssSpec?.title ?? null,
    }))
  )
}

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const spec = payload.mmssSpecId
    ? await db.mMSSSpec.findUnique({ where: { id: payload.mmssSpecId } })
    : payload.systemId
      ? await db.mMSSSpec.findUnique({ where: { systemId: payload.systemId } })
      : null

  if (!spec && !payload.specJson) {
    return NextResponse.json({ error: "MMSS spec or specJson is required" }, { status: 400 })
  }

  const config = await db.systemConfig.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  })

  const evaluation = await evaluateMMSSSpec({
    specJson: String(payload.specJson ?? spec?.specJson ?? "{}"),
    model: String(payload.model ?? config.ollamaModel),
    baseUrl: config.ollamaBaseUrl,
    timeout: config.ollamaTimeout,
    systemId: String(payload.systemId ?? spec?.systemId ?? ""),
    provider: payload.provider === "mistral" ? "mistral" : config.aiProvider === "mistral" ? "mistral" : "ollama",
    mistralModel: String(payload.mistralModel ?? config.mistralModel),
  })

  const report = await db.evaluationReport.create({
    data: {
      systemId: payload.systemId ?? spec?.systemId ?? "unknown",
      mmssSpecId: spec?.id ?? payload.mmssSpecId ?? null,
      overall: evaluation.overall,
      coherence: evaluation.coherence,
      coverage: evaluation.coverage,
      reuse: evaluation.reuse,
      falsifiability: evaluation.falsifiability,
      verdict: evaluation.verdict,
      strengths: JSON.stringify(evaluation.strengths),
      weaknesses: JSON.stringify(evaluation.weaknesses),
      recommendations: JSON.stringify(evaluation.recommendations),
      rawLlmComment: evaluation.rawLlmComment,
      ollamaModelUsed: String(payload.model ?? config.ollamaModel),
    },
  })

  if (spec) {
    await db.mMSSSpec.update({
      where: { id: spec.id },
      data: {
        bestScore: Math.max(spec.bestScore, report.overall),
        lastEval: report.createdAt,
      },
    })
  }

  return NextResponse.json({
    report,
    evaluation,
  })
}
