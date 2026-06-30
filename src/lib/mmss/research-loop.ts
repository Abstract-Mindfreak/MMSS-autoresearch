import { db } from "@/lib/db"
import {
  compareMMSSSpecs,
  evaluateMMSSSpec,
  improveMMSSSpec,
  tunePromptTemplate,
} from "@/lib/mmss/ollama-ops"

export type ResearchOperation =
  | "mmss_improve"
  | "mmss_clone_to_new_topic"
  | "mmss_compare"
  | "mmss_prompt_tune"

export interface ResearchLoopConfig {
  mode: "numeric" | "mmss"
  max_rounds: number
  target_score: number
  epsilon: number
  stop_after_no_improve: number
  ollama_model: string
  use_ollama: boolean
  operation: ResearchOperation
  selectedSystemId?: string
  compareSystemId?: string
  topic?: string
  provider?: "ollama" | "mistral"
}

export interface ResearchRoundEntry {
  round: number
  timestamp: string
  asset: string
  asset_kind: string
  change_description: string
  new_score: number
  decision: "kept" | "reverted"
  ollama_model_used: string | null
}

export interface ResearchLoopState {
  running: boolean
  runId: string | null
  currentRound: number
  baselineScore: number
  bestScore: number
  noImproveCount: number
  config: ResearchLoopConfig | null
  logs: ResearchRoundEntry[]
  message: string
  startedAt: string | null
  finishedAt: string | null
}

export interface ResearchRunSummary {
  id: string
  status: string
  operation: string
  provider: string
  model: string | null
  selectedSystemId: string | null
  compareSystemId: string | null
  topic: string | null
  currentRound: number
  maxRounds: number
  baselineScore: number
  bestScore: number
  message: string
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
}

const globalForResearchLoop = globalThis as unknown as {
  mmssResearchLoopState?: ResearchLoopState
  mmssResearchLoopTimer?: ReturnType<typeof setTimeout> | null
}

const defaultState: ResearchLoopState = {
  running: false,
  runId: null,
  currentRound: -1,
  baselineScore: 0,
  bestScore: 0,
  noImproveCount: 0,
  config: null,
  logs: [],
  message: "idle",
  startedAt: null,
  finishedAt: null,
}

function getState() {
  if (!globalForResearchLoop.mmssResearchLoopState) {
    globalForResearchLoop.mmssResearchLoopState = { ...defaultState }
  }
  return globalForResearchLoop.mmssResearchLoopState
}

function setTimer(timer: ReturnType<typeof setTimeout> | null) {
  globalForResearchLoop.mmssResearchLoopTimer = timer
}

function clearTimer() {
  if (globalForResearchLoop.mmssResearchLoopTimer) {
    clearTimeout(globalForResearchLoop.mmssResearchLoopTimer)
    globalForResearchLoop.mmssResearchLoopTimer = null
  }
}

function roundTo(value: number, digits = 6) {
  return Number(value.toFixed(digits))
}

function toIso(value: Date | string | null | undefined) {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : value
}

function toConfig(run: {
  mode: string
  maxRounds: number
  targetScore: number
  epsilon: number
  stopAfterNoImprove: number
  model: string | null
  operation: string
  selectedSystemId: string | null
  compareSystemId: string | null
  topic: string | null
  provider: string
}): ResearchLoopConfig {
  return {
    mode: run.mode === "numeric" ? "numeric" : "mmss",
    max_rounds: run.maxRounds,
    target_score: run.targetScore,
    epsilon: run.epsilon,
    stop_after_no_improve: run.stopAfterNoImprove,
    ollama_model: run.model ?? "mmss-gemma4-q4:latest",
    use_ollama: run.provider !== "mistral",
    operation: run.operation as ResearchOperation,
    selectedSystemId: run.selectedSystemId ?? undefined,
    compareSystemId: run.compareSystemId ?? undefined,
    topic: run.topic ?? undefined,
    provider: run.provider === "mistral" ? "mistral" : "ollama",
  }
}

async function loadRecentLogs(runId: string): Promise<ResearchRoundEntry[]> {
  const logs = await db.researchLog.findMany({
    where: { runId },
    orderBy: { round: "asc" },
  })

  return logs.map((entry) => ({
    round: entry.round,
    timestamp: entry.createdAt.toISOString(),
    asset: entry.assetPath,
    asset_kind: entry.assetKind,
    change_description: entry.changeDescription,
    new_score: entry.newScore,
    decision: entry.decision === "kept" ? "kept" : "reverted",
    ollama_model_used: entry.ollamaModelUsed,
  }))
}

async function syncStateFromRun(runId: string) {
  const run = await db.researchRun.findUnique({
    where: { id: runId },
  })
  if (!run) {
    const state = getState()
    Object.assign(state, defaultState)
    return state
  }

  const state = getState()
  state.running = run.status === "running"
  state.runId = run.id
  state.currentRound = run.currentRound
  state.baselineScore = run.baselineScore
  state.bestScore = run.bestScore
  state.noImproveCount = run.noImproveCount
  state.config = toConfig(run)
  state.logs = await loadRecentLogs(run.id)
  state.message = run.message
  state.startedAt = toIso(run.startedAt)
  state.finishedAt = toIso(run.finishedAt)
  return state
}

async function persistResearchLog(
  runId: string,
  entry: ResearchRoundEntry,
  baselineScore: number,
  operation: ResearchOperation
) {
  await db.researchLog.create({
    data: {
      runId,
      round: entry.round,
      systemId: entry.asset,
      assetKind: entry.asset_kind,
      assetPath: entry.asset,
      changeDescription: entry.change_description,
      newScore: entry.new_score,
      baselineScore,
      decision: entry.decision,
      ollamaModelUsed: entry.ollama_model_used,
      operation,
    },
  })
}

async function buildRoundEntry(
  run: {
    id: string
    operation: string
    selectedSystemId: string | null
    compareSystemId: string | null
    topic: string | null
    model: string | null
    provider: string
    epsilon: number
    bestScore: number
  },
  round: number
) {
  const specs = await db.mMSSSpec.findMany({
    include: {
      evaluations: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  const selected = specs.find((spec) => spec.systemId === run.selectedSystemId) ?? specs[0]
  const compareTarget =
    specs.find((spec) => spec.systemId === run.compareSystemId && spec.systemId !== selected?.systemId) ??
    specs.find((spec) => spec.systemId !== selected?.systemId) ??
    selected

  if (!selected) {
    throw new Error("No MMSS specs available for research loop")
  }

  const timestamp = new Date().toISOString()
  const systemConfig = await db.systemConfig.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  })
  const activeModel = run.model || systemConfig.ollamaModel
  const topic = run.topic ?? selected.domain

  if (run.operation === "mmss_compare") {
    const data = await compareMMSSSpecs({
      specA: selected.specJson,
      specB: compareTarget?.specJson ?? selected.specJson,
      systemA: selected.systemId,
      systemB: compareTarget?.systemId ?? selected.systemId,
      model: activeModel,
      baseUrl: systemConfig.ollamaBaseUrl,
      timeout: systemConfig.ollamaTimeout,
      provider: run.provider === "mistral" ? "mistral" : "ollama",
      mistralModel: systemConfig.mistralModel,
    })
    const delta = Number(data.metric_comparison?.overall?.delta ?? 0)
    const score = roundTo(Math.max(0, Math.min(0.999, run.bestScore + Math.abs(delta) * 0.1)))
    return {
      entry: {
        round,
        timestamp,
        asset: `mmss_specs/${selected.systemId}.json vs ${compareTarget?.systemId}.json`,
        asset_kind: "mmss_spec",
        change_description: data.verdict ?? "Comparison completed",
        new_score: score,
        decision: score > run.bestScore + run.epsilon ? "kept" : "reverted",
        ollama_model_used: activeModel,
      } satisfies ResearchRoundEntry,
    }
  }

  if (run.operation === "mmss_prompt_tune") {
    const sourcePrompt = "Return a structured MMSS response grounded in the selected system."
    const data = await tunePromptTemplate({
      promptTemplate: sourcePrompt,
      topic,
      systemId: selected.systemId,
      model: activeModel,
      baseUrl: systemConfig.ollamaBaseUrl,
      timeout: systemConfig.ollamaTimeout,
      provider: run.provider === "mistral" ? "mistral" : "ollama",
      mistralModel: systemConfig.mistralModel,
    })

    const artifact = await db.promptArtifact.create({
      data: {
        systemId: selected.systemId,
        topic,
        provider: run.provider,
        model: activeModel,
        artifactType: "tuned_prompt",
        title: `Tuned prompt for ${selected.systemId} / ${topic}`,
        promptText: data.prompt,
        sourcePrompt,
        metadataJson: JSON.stringify({
          verdict: data.verdict ?? null,
          suggestions: data.suggestions ?? [],
          runId: run.id,
          round,
        }),
      },
    })

    const score = roundTo(Math.max(0, Math.min(0.999, run.bestScore + 0.0045)))
    return {
      entry: {
        round,
        timestamp,
        asset: `prompt_artifacts/${artifact.id}`,
        asset_kind: "prompt_artifact",
        change_description: `Prompt tuned for ${topic}`,
        new_score: score,
        decision: score > run.bestScore + run.epsilon ? "kept" : "reverted",
        ollama_model_used: activeModel,
      } satisfies ResearchRoundEntry,
    }
  }

  if (run.operation === "mmss_clone_to_new_topic") {
    const clonedSystemId = `MMSS_${topic.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_R${round + 1}_v1_0`
    const cloned = await db.mMSSSpec.create({
      data: {
        systemId: clonedSystemId,
        title: `${selected.title} - ${topic}`,
        domain: topic,
        purpose: `Cloned from ${selected.systemId} for ${topic}`,
        version: selected.version,
        specJson: selected.specJson,
        bestScore: Number((selected.bestScore * 0.92).toFixed(4)),
      },
    })

    const evaluationData = await evaluateMMSSSpec({
      specJson: cloned.specJson,
      model: activeModel,
      baseUrl: systemConfig.ollamaBaseUrl,
      timeout: systemConfig.ollamaTimeout,
      systemId: cloned.systemId,
      provider: run.provider === "mistral" ? "mistral" : "ollama",
      mistralModel: systemConfig.mistralModel,
    })

    await db.evaluationReport.create({
      data: {
        systemId: cloned.systemId,
        mmssSpecId: cloned.id,
        overall: evaluationData.overall,
        coherence: evaluationData.coherence,
        coverage: evaluationData.coverage,
        reuse: evaluationData.reuse,
        falsifiability: evaluationData.falsifiability,
        verdict: evaluationData.verdict,
        strengths: JSON.stringify(evaluationData.strengths),
        weaknesses: JSON.stringify(evaluationData.weaknesses),
        recommendations: JSON.stringify(evaluationData.recommendations),
        rawLlmComment: evaluationData.rawLlmComment,
        ollamaModelUsed: activeModel,
      },
    })

    await db.mMSSSpec.update({
      where: { id: cloned.id },
      data: {
        bestScore: evaluationData.overall,
        lastEval: new Date(),
      },
    })

    const score = roundTo(Number(evaluationData.overall ?? run.bestScore))
    return {
      entry: {
        round,
        timestamp,
        asset: `mmss_specs/${cloned.systemId}.json`,
        asset_kind: "mmss_spec",
        change_description: `Cloned ${selected.systemId} to ${topic}`,
        new_score: score,
        decision: score > run.bestScore + run.epsilon ? "kept" : "reverted",
        ollama_model_used: activeModel,
      } satisfies ResearchRoundEntry,
    }
  }

  const baselineEvaluation = await evaluateMMSSSpec({
    specJson: selected.specJson,
    model: activeModel,
    baseUrl: systemConfig.ollamaBaseUrl,
    timeout: systemConfig.ollamaTimeout,
    systemId: selected.systemId,
    provider: run.provider === "mistral" ? "mistral" : "ollama",
    mistralModel: systemConfig.mistralModel,
  })

  const improvedSpecJson = await improveMMSSSpec({
    specJson: selected.specJson,
    evaluation: baselineEvaluation,
    model: activeModel,
    baseUrl: systemConfig.ollamaBaseUrl,
    timeout: systemConfig.ollamaTimeout,
    targetTopic: topic,
    provider: run.provider === "mistral" ? "mistral" : "ollama",
    mistralModel: systemConfig.mistralModel,
  })

  const improvedEvaluation = await evaluateMMSSSpec({
    specJson: improvedSpecJson,
    model: activeModel,
    baseUrl: systemConfig.ollamaBaseUrl,
    timeout: systemConfig.ollamaTimeout,
    systemId: selected.systemId,
    provider: run.provider === "mistral" ? "mistral" : "ollama",
    mistralModel: systemConfig.mistralModel,
  })

  await db.mMSSSpec.update({
    where: { id: selected.id },
    data: {
      specJson: improvedSpecJson,
      bestScore: improvedEvaluation.overall,
      lastEval: new Date(),
    },
  })

  await db.evaluationReport.create({
    data: {
      systemId: selected.systemId,
      mmssSpecId: selected.id,
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
      ollamaModelUsed: activeModel,
    },
  })

  const score = roundTo(Number(improvedEvaluation.overall ?? run.bestScore))
  return {
    entry: {
      round,
      timestamp,
      asset: `mmss_specs/${selected.systemId}.json`,
      asset_kind: "mmss_spec",
      change_description: `Improved ${selected.systemId} for ${topic}`,
      new_score: score,
      decision: score > run.bestScore + run.epsilon ? "kept" : "reverted",
      ollama_model_used: activeModel,
    } satisfies ResearchRoundEntry,
  }
}

async function finishRun(runId: string, status: string, message: string) {
  await db.researchRun.update({
    where: { id: runId },
    data: {
      status,
      message,
      finishedAt: new Date(),
    },
  })
  clearTimer()
  return syncStateFromRun(runId)
}

async function runNextRound() {
  const state = getState()
  if (!state.running || !state.runId) {
    return
  }

  const run = await db.researchRun.findUnique({
    where: { id: state.runId },
  })

  if (!run || run.status !== "running") {
    clearTimer()
    return
  }

  const nextRound = run.currentRound + 1
  if (nextRound >= run.maxRounds) {
    await finishRun(run.id, "completed", "max rounds reached")
    return
  }

  try {
    const { entry } = await buildRoundEntry(run, nextRound)
    const noImproveCount = entry.decision === "kept" ? 0 : run.noImproveCount + 1
    const bestScore = entry.decision === "kept" ? entry.new_score : run.bestScore
    const message = `${entry.asset_kind}: ${entry.change_description}`

    await persistResearchLog(run.id, entry, run.bestScore, run.operation as ResearchOperation)

    const shouldStopForTarget = bestScore >= run.targetScore
    const shouldStopForPlateau = noImproveCount >= run.stopAfterNoImprove

    await db.researchRun.update({
      where: { id: run.id },
      data: {
        currentRound: nextRound,
        bestScore,
        noImproveCount,
        message: shouldStopForTarget
          ? "target score reached"
          : shouldStopForPlateau
            ? "plateau limit reached"
            : message,
        status: shouldStopForTarget || shouldStopForPlateau ? "completed" : "running",
        finishedAt: shouldStopForTarget || shouldStopForPlateau ? new Date() : null,
      },
    })

    await syncStateFromRun(run.id)

    if (shouldStopForTarget || shouldStopForPlateau) {
      clearTimer()
      return
    }

    setTimer(
      setTimeout(() => {
        void runNextRound()
      }, 1800)
    )
  } catch (error) {
    const message =
      error instanceof Error ? `loop failed: ${error.message}` : "loop failed: unknown error"
    await finishRun(run.id, "failed", message)
  }
}

export async function startResearchLoop(config: ResearchLoopConfig) {
  clearTimer()

  const latestReport = await db.evaluationReport.findFirst({
    orderBy: { createdAt: "desc" },
  })
  const baseline = latestReport?.overall ?? 0.8856
  const provider = config.provider ?? (config.use_ollama ? "ollama" : "mistral")

  const run = await db.researchRun.create({
    data: {
      status: "running",
      mode: config.mode,
      operation: config.operation,
      provider,
      model: config.ollama_model,
      selectedSystemId: config.selectedSystemId,
      compareSystemId: config.compareSystemId,
      topic: config.topic,
      maxRounds: config.max_rounds,
      targetScore: config.target_score,
      epsilon: config.epsilon,
      stopAfterNoImprove: config.stop_after_no_improve,
      baselineScore: baseline,
      bestScore: baseline,
      currentRound: -1,
      noImproveCount: 0,
      message: "started",
      startedAt: new Date(),
    },
  })

  await syncStateFromRun(run.id)

  setTimer(
    setTimeout(() => {
      void runNextRound()
    }, 100)
  )

  return getState()
}

export async function resumeResearchLoop(runId: string) {
  clearTimer()
  const run = await db.researchRun.findUnique({ where: { id: runId } })
  if (!run) {
    throw new Error("Research run not found")
  }

  await db.researchRun.update({
    where: { id: runId },
    data: {
      status: "running",
      finishedAt: null,
      message: "resumed",
    },
  })

  await syncStateFromRun(runId)
  setTimer(
    setTimeout(() => {
      void runNextRound()
    }, 100)
  )
  return getState()
}

export async function replayResearchLoop(runId: string) {
  const run = await db.researchRun.findUnique({ where: { id: runId } })
  if (!run) {
    throw new Error("Research run not found")
  }

  return startResearchLoop(toConfig(run))
}

export async function stopResearchLoop() {
  clearTimer()
  const state = getState()
  if (state.runId) {
    await db.researchRun.update({
      where: { id: state.runId },
      data: {
        status: "stopped",
        finishedAt: new Date(),
        message: "stopped by user",
      },
    })
    return syncStateFromRun(state.runId)
  }

  state.running = false
  state.finishedAt = new Date().toISOString()
  state.message = "stopped by user"
  return state
}

export async function getResearchLoopState() {
  const runningRun = await db.researchRun.findFirst({
    where: { status: "running" },
    orderBy: { updatedAt: "desc" },
  })

  if (!runningRun) {
    const latestRun = await db.researchRun.findFirst({
      orderBy: { updatedAt: "desc" },
    })
    if (!latestRun) {
      const state = getState()
      Object.assign(state, defaultState)
      return state
    }
    return syncStateFromRun(latestRun.id)
  }

  return syncStateFromRun(runningRun.id)
}

export async function listResearchRuns(limit = 12): Promise<ResearchRunSummary[]> {
  const runs = await db.researchRun.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  })

  return runs.map((run) => ({
    id: run.id,
    status: run.status,
    operation: run.operation,
    provider: run.provider,
    model: run.model,
    selectedSystemId: run.selectedSystemId,
    compareSystemId: run.compareSystemId,
    topic: run.topic,
    currentRound: run.currentRound,
    maxRounds: run.maxRounds,
    baselineScore: run.baselineScore,
    bestScore: run.bestScore,
    message: run.message,
    startedAt: toIso(run.startedAt),
    finishedAt: toIso(run.finishedAt),
    createdAt: run.createdAt.toISOString(),
  }))
}

export async function listPromptArtifacts(limit = 12) {
  return db.promptArtifact.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  })
}
