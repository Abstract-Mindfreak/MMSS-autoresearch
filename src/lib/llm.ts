import {
  chat as ollamaChat,
  generate as ollamaGenerate,
  generateStream as ollamaGenerateStream,
  type OllamaChatMessage,
} from "@/lib/ollama"
import { mistralChat } from "@/lib/mistral"

export type LLMProvider = "ollama" | "mistral"

export interface LLMConfig {
  provider: LLMProvider
  ollamaModel: string
  mistralModel: string
  ollamaBaseUrl: string
  timeoutSeconds: number
}

export async function generateText(
  prompt: string,
  config: LLMConfig,
  options?: { temperature?: number; num_predict?: number }
) {
  if (config.provider === "mistral") {
    return mistralChat([{ role: "user", content: prompt }], config.mistralModel, config.timeoutSeconds)
  }

  return ollamaGenerate(
    prompt,
    config.ollamaModel,
    config.ollamaBaseUrl,
    config.timeoutSeconds,
    options
  )
}

export async function chatText(messages: OllamaChatMessage[], config: LLMConfig) {
  if (config.provider === "mistral") {
    return mistralChat(messages, config.mistralModel, config.timeoutSeconds)
  }

  return ollamaChat(messages, config.ollamaModel, config.ollamaBaseUrl, config.timeoutSeconds)
}

export async function createChatEventStream(prompt: string, config: LLMConfig) {
  if (config.provider === "mistral") {
    const text = await mistralChat([{ role: "user", content: prompt }], config.mistralModel, config.timeoutSeconds)
    const encoder = new TextEncoder()
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: text })}\n\n`))
        controller.close()
      },
    })
  }

  return ollamaGenerateStream(prompt, config.ollamaModel, config.ollamaBaseUrl)
}
