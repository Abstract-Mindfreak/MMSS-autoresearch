"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIAssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Welcome to MMSS AI Assistant. I can help you analyze domains, run semantic reassembly cycles, and navigate temporal scenarios. How can I help you?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I've analyzed your input using the PFR engine. The semantic gravity coefficient is 0.87, suggesting high domain relevance. Shall I run a full reassembly cycle?",
        "Using the FRP temporal navigator, I've mapped 3 recursive pathways through your query. The primary path shows 87% coherence with the target domain.",
        "Context weaving initiated. A-MMSS has integrated 4 semantic layers. The optimization target has been achieved at 0.85 efficiency.",
        "Based on multi-level semantic analysis, I recommend activating the full MMSS pipeline. This will provide the most comprehensive fractal reassembly of your request.",
        "The golden derivation ⊢ᵍ indicates a strong semantic relationship. I can proceed with the context weaving cycle if you confirm.",
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Assistant</h2>
            <p className="text-[10px] text-[#8b949e]">MMSS-Powered Chat</p>
          </div>
        </div>
        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Online
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 ${
                message.role === "user"
                  ? "bg-emerald-600/20 border border-emerald-500/30 text-[#c9d1d9]"
                  : "bg-[#161b22] border border-[#30363d] text-[#c9d1d9]"
              }`}
            >
              <p className="text-[11px] leading-relaxed">{message.content}</p>
              <span className="text-[9px] text-[#8b949e] mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8b949e] animate-bounce" />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-[#8b949e] animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-[#8b949e] animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#30363d] p-2 shrink-0">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-[#161b22] border-[#30363d] text-white text-[12px] min-h-[36px] max-h-[80px] resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 w-9 p-0"
          >
            ↑
          </Button>
        </div>
      </div>
    </div>
  );
}
