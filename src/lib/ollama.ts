export interface OllamaGenerateOptions {
  temperature?: number
  num_predict?: number
}

export interface OllamaChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export class OllamaClientError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "OllamaClientError"
  }
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "")
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
      throw new OllamaClientError(`Ollama request timed out after ${Math.round(timeoutMs / 1000)}s`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export async function ping(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(`${normalizeBaseUrl(baseUrl)}/api/tags`, { method: "GET" }, 10_000)
    return response.ok
  } catch {
    return false
  }
}

export async function listModels(baseUrl: string): Promise<string[]> {
  const response = await fetchWithTimeout(`${normalizeBaseUrl(baseUrl)}/api/tags`, { method: "GET" }, 15_000)
  if (!response.ok) {
    throw new OllamaClientError(`Failed to load Ollama models: ${response.status} ${response.statusText}`)
  }

  const payload = await response.json() as { models?: Array<{ name?: string }> }
  return (payload.models ?? []).map((entry) => entry.name).filter((name): name is string => Boolean(name))
}

export async function generate(
  prompt: string,
  model: string,
  baseUrl: string,
  timeout: number,
  options: OllamaGenerateOptions = {}
): Promise<string> {
  const response = await fetchWithTimeout(
    `${normalizeBaseUrl(baseUrl)}/api/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options,
      }),
    },
    timeout * 1000
  )

  if (!response.ok) {
    const details = await response.text()
    throw new OllamaClientError(`Ollama generate failed: ${response.status} ${details}`)
  }

  const payload = await response.json() as { response?: string }
  return payload.response ?? ""
}

export async function chat(
  messages: OllamaChatMessage[],
  model: string,
  baseUrl: string,
  timeout: number
): Promise<string> {
  const response = await fetchWithTimeout(
    `${normalizeBaseUrl(baseUrl)}/api/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    },
    timeout * 1000
  )

  if (!response.ok) {
    const details = await response.text()
    throw new OllamaClientError(`Ollama chat failed: ${response.status} ${details}`)
  }

  const payload = await response.json() as { message?: { content?: string }, response?: string }
  return payload.message?.content ?? payload.response ?? ""
}

export async function generateStream(
  prompt: string,
  model: string,
  baseUrl: string
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: true,
    }),
    cache: "no-store",
  })

  if (!response.ok || !response.body) {
    const details = await response.text()
    throw new OllamaClientError(`Ollama stream failed: ${response.status} ${details}`)
  }

  return response.body
}
