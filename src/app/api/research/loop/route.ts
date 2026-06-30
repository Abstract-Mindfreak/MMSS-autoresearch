import { NextRequest, NextResponse } from "next/server"
import {
  getResearchLoopState,
  listPromptArtifacts,
  listResearchRuns,
  replayResearchLoop,
  resumeResearchLoop,
  startResearchLoop,
  stopResearchLoop,
  type ResearchLoopConfig,
} from "@/lib/mmss/research-loop"

export async function GET() {
  const [state, runs, promptArtifacts] = await Promise.all([
    getResearchLoopState(),
    listResearchRuns(),
    listPromptArtifacts(),
  ])
  return NextResponse.json({ ...state, runs, promptArtifacts })
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<ResearchLoopConfig>
  if (payload && typeof (payload as { action?: unknown }).action === "string") {
    const action = String((payload as { action?: unknown }).action)
    const runId = String((payload as { runId?: unknown }).runId ?? "").trim()
    if (!runId) {
      return NextResponse.json({ error: "runId is required" }, { status: 400 })
    }
    if (action === "resume") {
      const state = await resumeResearchLoop(runId)
      return NextResponse.json(state)
    }
    if (action === "replay") {
      const state = await replayResearchLoop(runId)
      return NextResponse.json(state)
    }
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
  }

  const config: ResearchLoopConfig = {
    mode: payload.mode ?? "mmss",
    max_rounds: payload.max_rounds ?? 12,
    target_score: payload.target_score ?? 0.92,
    epsilon: payload.epsilon ?? 0.0005,
    stop_after_no_improve: payload.stop_after_no_improve ?? 3,
    ollama_model:
      payload.provider === "mistral"
        ? String((payload as { mistral_model?: string }).mistral_model ?? "mistral-small-latest")
        : payload.ollama_model ?? "mmss-gemma4-q4:latest",
    use_ollama: payload.use_ollama ?? true,
    operation: payload.operation ?? "mmss_improve",
    selectedSystemId: payload.selectedSystemId,
    compareSystemId: payload.compareSystemId,
    topic: payload.topic,
    provider: payload.provider === "mistral" ? "mistral" : "ollama",
  }

  const state = await startResearchLoop(config)
  return NextResponse.json(state)
}

export async function DELETE() {
  return NextResponse.json(await stopResearchLoop())
}
