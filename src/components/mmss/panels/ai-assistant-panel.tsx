"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface SavedSession {
  id: string
  title: string
  createdAt: string
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: string
  }>
}

export function AIAssistantPanel() {
  const [sessions, setSessions] = useState<SavedSession[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = window.localStorage.getItem("mmss-ai-sessions")
      if (!raw) return []
      const parsed = JSON.parse(raw) as SavedSession[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Welcome to MMSS AI Assistant. I can help you analyze domains, run semantic reassembly cycles, and navigate temporal scenarios. How can I help you?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState("")
  const [provider, setProvider] = useState<"ollama" | "mistral">("ollama")
  const [selectedSessionId, setSelectedSessionId] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const persistSession = (nextMessages: Message[], explicitSessionId?: string) => {
    if (nextMessages.length <= 1) return
    const titleSource = nextMessages.find((message) => message.role === "user")?.content ?? "AI session"
    const nextSession: SavedSession = {
      id: explicitSessionId || selectedSessionId || `session-${Date.now()}`,
      title: titleSource.slice(0, 48),
      createdAt: new Date().toISOString(),
      messages: nextMessages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
      })),
    }

    setSessions((prev) => {
      const merged = [nextSession, ...prev.filter((session) => session.id !== nextSession.id)].slice(0, 20)
      window.localStorage.setItem("mmss-ai-sessions", JSON.stringify(merged))
      return merged
    })

    if (!selectedSessionId) {
      setSelectedSessionId(nextSession.id)
    }
  }

  const loadSession = (sessionId: string) => {
    setSelectedSessionId(sessionId)
    const match = sessions.find((session) => session.id === sessionId)
    if (!match) return
    const nextMessages = match.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: new Date(message.timestamp),
      }))
    setMessages(nextMessages)
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const nextInput = input
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: nextInput,
      timestamp: new Date(),
    }

    const assistantId = `${Date.now()}-assistant`
    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      },
    ])
    setInput("")
    setIsTyping(true)
    setError("")

    try {
      await fetch("/api/settings/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      })

      const response = await fetch("/api/ai/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: nextInput }),
      })

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? "AI request failed")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let fullResponse = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split("\n\n")
        buffer = events.pop() ?? ""

        for (const event of events) {
          const line = event
            .split("\n")
            .find((entry) => entry.startsWith("data: "))
          if (!line) continue

          const payload = line.slice(6).trim()
          if (!payload) continue

          try {
            const parsed = JSON.parse(payload) as {
              response?: string
              message?: { content?: string }
              error?: string
            }

            if (parsed.error) {
              throw new Error(parsed.error)
            }

            const chunk = parsed.response ?? parsed.message?.content ?? ""
            if (!chunk) continue

            fullResponse += chunk
          } catch {
            fullResponse += payload
          }

          setMessages((prev) => {
            const nextMessages = prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: fullResponse }
                : message
            )
            persistSession(nextMessages)
            return nextMessages
          })
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "AI request failed"
      setError(message)
      setMessages((prev) => {
        const nextMessages = prev.map((entry) =>
          entry.id === assistantId
            ? { ...entry, content: `Request failed: ${message}` }
            : entry
        )
        persistSession(nextMessages)
        return nextMessages
      })
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#0d1117] text-[#c9d1d9]">
      <div className="shrink-0 border-b border-[#30363d] px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">AI</span>
            <div>
              <h2 className="text-sm font-semibold text-white">AI Assistant</h2>
              <p className="text-[10px] text-[#8b949e]">MMSS-Powered Chat</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedSessionId}
              onChange={(e) => loadSession(e.target.value)}
              className="max-w-[180px] rounded-md border border-[#30363d] bg-[#161b22] px-2 py-1 text-[9px] text-[#c9d1d9]"
            >
              <option value="">Current session</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title}
                </option>
              ))}
            </select>
            <div className="flex rounded-md border border-[#30363d] bg-[#161b22] p-0.5">
              {(["ollama", "mistral"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setProvider(value)}
                  className={`rounded px-2 py-0.5 text-[9px] ${
                    provider === value ? "bg-emerald-500/20 text-emerald-400" : "text-[#8b949e]"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {error ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
            {error}
          </div>
        ) : null}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 ${
                message.role === "user"
                  ? "border border-emerald-500/30 bg-emerald-600/20 text-[#c9d1d9]"
                  : "border border-[#30363d] bg-[#161b22] text-[#c9d1d9]"
              }`}
            >
              <p className="whitespace-pre-wrap text-[11px] leading-relaxed">
                {message.content || "..."}
              </p>
              <span className="mt-1 block text-[9px] text-[#8b949e]">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isTyping ? (
          <div className="flex justify-start">
            <div className="rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-2">
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8b949e]" />
                <div
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8b949e]"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8b949e]"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-[#30363d] p-2">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[36px] max-h-[80px] flex-1 resize-none border-[#30363d] bg-[#161b22] text-[12px] text-white"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                void sendMessage()
              }
            }}
          />
          <Button
            onClick={() => void sendMessage()}
            disabled={!input.trim() || isTyping}
            size="sm"
            className="h-9 w-9 bg-emerald-600 p-0 text-white hover:bg-emerald-700"
          >
            ^
          </Button>
        </div>
      </div>
    </div>
  )
}
