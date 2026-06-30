import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chatText } from "@/lib/llm"
import { ORCHESTRATOR_AGENTS, generateAgentPrompt } from "@/lib/mmss/orchestrator"

export async function POST(request: NextRequest) {
  const payload = await request.json()
  const question = String(payload.question ?? "").trim()
  if (!question) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 })
  }

  const config = await db.systemConfig.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  })

  const requestedAgentIds = Array.isArray(payload.agentIds)
    ? payload.agentIds.map((entry: unknown) => String(entry))
    : []
  const selectedAgents = requestedAgentIds.length > 0
    ? ORCHESTRATOR_AGENTS.filter((agent) => requestedAgentIds.includes(agent.id) || requestedAgentIds.includes(agent.name))
    : ORCHESTRATOR_AGENTS

  const outputs = []
  let context = ""
  for (const agent of selectedAgents) {
    const prompt = generateAgentPrompt(agent, question, context)
    const output = await chatText([{ role: "user", content: prompt }], {
      provider: config.aiProvider === "mistral" ? "mistral" : "ollama",
      ollamaModel: config.ollamaModel,
      mistralModel: config.mistralModel,
      ollamaBaseUrl: config.ollamaBaseUrl,
      timeoutSeconds: config.ollamaTimeout,
    })
    outputs.push({ agent, output, prompt })
    context += `\n\n[${agent.name}]\n${output}`
  }

  return NextResponse.json({
    outputs,
    provider: config.aiProvider,
    model: config.aiProvider === "mistral" ? config.mistralModel : config.ollamaModel,
  })
}
