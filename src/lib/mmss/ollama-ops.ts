import { generateText, type LLMProvider } from "@/lib/llm"

export interface MMSSEvaluationResult {
  coherence: number
  coverage: number
  reuse: number
  falsifiability: number
  overall: number
  verdict: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  rawLlmComment: string
}

export interface MMSSCompareResult {
  verdict: string
  winner: string
  analysis: string
  metric_comparison: Record<string, { a: number; b: number; delta: number }>
  rawLlmComment: string
}

function clampScore(value: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Math.min(1, value))
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function safeStringArray(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value)) return fallback
  return value.map((item) => String(item)).filter(Boolean)
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim()
  const directCandidates = [trimmed]

  const firstBrace = trimmed.indexOf("{")
  const lastBrace = trimmed.lastIndexOf("}")
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    directCandidates.push(trimmed.slice(firstBrace, lastBrace + 1))
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fencedMatch?.[1]) {
    directCandidates.push(fencedMatch[1].trim())
  }

  for (const candidate of directCandidates) {
    try {
      const parsed = JSON.parse(candidate)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    } catch {
      continue
    }
  }

  return null
}

function parseScoreFromText(text: string, key: string, fallback: number) {
  const regex = new RegExp(`${key}\\s*["=: ]+\\s*([0-9.]+)`, "i")
  const match = text.match(regex)
  return clampScore(match ? Number(match[1]) : fallback, fallback)
}

export async function evaluateMMSSSpec(params: {
  specJson: string
  model: string
  baseUrl: string
  timeout: number
  systemId?: string
  provider?: LLMProvider
  mistralModel?: string
}) {
  const prompt = [
    "You are an MMSS system evaluator.",
    "Analyze the MMSS JSON specification and score it from 0.0 to 1.0.",
    'Return JSON with keys: coherence, coverage, reuse, falsifiability, verdict, strengths, weaknesses, recommendations.',
    "Use arrays for strengths, weaknesses, recommendations.",
    "If the spec is incomplete, still evaluate it and explain the main gaps.",
    params.systemId ? `System ID: ${params.systemId}` : "",
    "MMSS Spec:",
    params.specJson,
  ]
    .filter(Boolean)
    .join("\n\n")

  const raw = await generateText(prompt, {
    provider: params.provider ?? "ollama",
    ollamaModel: params.model,
    mistralModel: params.mistralModel ?? params.model,
    ollamaBaseUrl: params.baseUrl,
    timeoutSeconds: params.timeout,
  }, { temperature: 0.2, num_predict: 1200 })

  const parsed = extractJsonObject(raw)
  const coherence = clampScore(Number(parsed?.coherence), parseScoreFromText(raw, "coherence", 0.7))
  const coverage = clampScore(Number(parsed?.coverage), parseScoreFromText(raw, "coverage", 0.7))
  const reuse = clampScore(Number(parsed?.reuse), parseScoreFromText(raw, "reuse", 0.68))
  const falsifiability = clampScore(
    Number(parsed?.falsifiability),
    parseScoreFromText(raw, "falsifiability", 0.6)
  )
  const overall = Number(average([coherence, coverage, reuse, falsifiability]).toFixed(4))

  const result: MMSSEvaluationResult = {
    coherence,
    coverage,
    reuse,
    falsifiability,
    overall,
    verdict: String(parsed?.verdict ?? "Evaluation completed with fallback parsing."),
    strengths: safeStringArray(parsed?.strengths, ["Evaluation completed"]),
    weaknesses: safeStringArray(parsed?.weaknesses, ["Structured parser fallback used"]),
    recommendations: safeStringArray(parsed?.recommendations, [
      "Refine the MMSS spec and rerun evaluation.",
    ]),
    rawLlmComment: raw,
  }

  return result
}

export async function improveMMSSSpec(params: {
  specJson: string
  evaluation: MMSSEvaluationResult
  model: string
  baseUrl: string
  timeout: number
  targetTopic?: string
  provider?: LLMProvider
  mistralModel?: string
}) {
  const prompt = [
    "You improve MMSS JSON specifications.",
    "Return only JSON for the improved MMSS spec.",
    "Preserve the original structure when possible.",
    params.targetTopic ? `Adapt the improved spec to topic: ${params.targetTopic}.` : "",
    "Evaluation feedback:",
    JSON.stringify(params.evaluation, null, 2),
    "Original MMSS Spec:",
    params.specJson,
  ]
    .filter(Boolean)
    .join("\n\n")

  const raw = await generateText(prompt, {
    provider: params.provider ?? "ollama",
    ollamaModel: params.model,
    mistralModel: params.mistralModel ?? params.model,
    ollamaBaseUrl: params.baseUrl,
    timeoutSeconds: params.timeout,
  }, { temperature: 0.35, num_predict: 1600 })

  const parsed = extractJsonObject(raw)
  if (parsed) {
    return JSON.stringify(parsed, null, 2)
  }

  try {
    const original = JSON.parse(params.specJson) as Record<string, unknown>
    const improved = {
      ...original,
      purpose: `${String(original.purpose ?? "MMSS spec")} [improved by Ollama]`,
      improvement_notes: raw.slice(0, 2000),
      target_topic: params.targetTopic ?? null,
    }
    return JSON.stringify(improved, null, 2)
  } catch {
    return JSON.stringify(
      {
        raw_original_spec: params.specJson,
        improvement_notes: raw.slice(0, 2000),
        target_topic: params.targetTopic ?? null,
      },
      null,
      2
    )
  }
}

export async function compareMMSSSpecs(params: {
  specA: string
  specB: string
  systemA: string
  systemB: string
  model: string
  baseUrl: string
  timeout: number
  provider?: LLMProvider
  mistralModel?: string
}) {
  const prompt = [
    "You compare two MMSS JSON specifications.",
    "Return JSON with keys: verdict, winner, analysis, metric_comparison.",
    "metric_comparison must contain coherence, coverage, reuse, falsifiability, overall.",
    "Each metric should have fields a, b, delta.",
    `System A: ${params.systemA}`,
    params.specA,
    `System B: ${params.systemB}`,
    params.specB,
  ].join("\n\n")

  const raw = await generateText(prompt, {
    provider: params.provider ?? "ollama",
    ollamaModel: params.model,
    mistralModel: params.mistralModel ?? params.model,
    ollamaBaseUrl: params.baseUrl,
    timeoutSeconds: params.timeout,
  }, { temperature: 0.2, num_predict: 1400 })

  const parsed = extractJsonObject(raw)
  const comparison = (parsed?.metric_comparison ?? {}) as Record<
    string,
    { a?: number; b?: number; delta?: number }
  >

  const normalized: Record<string, { a: number; b: number; delta: number }> = {}
  for (const metric of ["coherence", "coverage", "reuse", "falsifiability", "overall"]) {
    const candidate = comparison[metric]
    const a = Number(candidate?.a ?? 0)
    const b = Number(candidate?.b ?? 0)
    normalized[metric] = {
      a,
      b,
      delta: Number((Number(candidate?.delta ?? a - b)).toFixed(4)),
    }
  }

  return {
    verdict: String(parsed?.verdict ?? "Comparison completed."),
    winner: String(parsed?.winner ?? "tie"),
    analysis: String(parsed?.analysis ?? raw.slice(0, 1200)),
    metric_comparison: normalized,
    rawLlmComment: raw,
  } satisfies MMSSCompareResult
}

export async function tunePromptTemplate(params: {
  promptTemplate: string
  topic: string
  systemId?: string
  model: string
  baseUrl: string
  timeout: number
  provider?: LLMProvider
  mistralModel?: string
}) {
  const prompt = [
    "You tune prompts for MMSS workflows.",
    "Return the improved prompt text only. No JSON wrapper is required.",
    params.systemId ? `System ID: ${params.systemId}` : "",
    `Target topic: ${params.topic || "general"}`,
    "Current prompt template:",
    params.promptTemplate,
  ]
    .filter(Boolean)
    .join("\n\n")

  const raw = await generateText(prompt, {
    provider: params.provider ?? "ollama",
    ollamaModel: params.model,
    mistralModel: params.mistralModel ?? params.model,
    ollamaBaseUrl: params.baseUrl,
    timeoutSeconds: params.timeout,
  }, { temperature: 0.4, num_predict: 1200 })

  return raw.trim() || params.promptTemplate
}
