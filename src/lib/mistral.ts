import { OllamaClientError } from "@/lib/ollama"

export interface MistralChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

function getApiKey() {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    throw new OllamaClientError("Mistral API key is missing. Set MISTRAL_API_KEY in the environment.")
  }
  return apiKey
}

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(input, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
    })
    return response
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new OllamaClientError(`Mistral request timed out after ${Math.round(timeoutMs / 1000)}s`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export async function mistralChat(
  messages: MistralChatMessage[],
  model: string,
  timeoutSeconds: number
) {
  const response = await fetchWithTimeout(
    "https://api.mistral.ai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.35,
      }),
    },
    timeoutSeconds * 1000
  )

  if (!response.ok) {
    const details = await response.text()
    throw new OllamaClientError(`Mistral chat failed: ${response.status} ${details}`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return payload.choices?.[0]?.message?.content ?? ""
}
