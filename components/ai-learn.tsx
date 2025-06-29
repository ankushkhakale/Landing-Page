"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send, Bot } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export function AILearn() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm your AI learning assistant. Ask me anything to get started!",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, userId: "ai-learn-demo", mode: "teach" }),
      })

      const data = await response.json()

      let aiResponseText = "Sorry, I'm having trouble responding right now. Please try again! 😅"
      if (data.response) {
        aiResponseText = data.response
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseText,
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm having trouble connecting right now, but I'm here to help! Try asking me something about your studies! 😊",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="relative min-h-screen h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2e1065] via-[#581c87] to-[#a21caf] bg-fixed overflow-hidden font-sans">
      {/* Structured chat box */}
      <div className="w-full max-w-2xl flex flex-col justify-end h-[80vh] bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6">
          {messages.map((message, idx) => (
            <div
              key={message.id}
              className={`flex items-end ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "ai" && (
                <div className="mr-2 flex items-end">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg border-2 border-white/30">
                    <Bot className="w-5 h-5 text-white" />
                  </span>
                </div>
              )}
              <div
                className={`max-w-lg px-6 py-4 rounded-3xl text-base font-medium shadow-md transition-all duration-200 animate-pop-in whitespace-pre-wrap
                  ${message.sender === "ai"
                    ? "bg-white/90 text-gray-900 rounded-bl-none drop-shadow-2xl"
                    : "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-none mr-2 drop-shadow-2xl"}
                `}
              >
                {message.content}
                <span className="block text-xs mt-1 text-gray-500 text-right">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end justify-start">
              <div className="max-w-lg px-6 py-4 rounded-3xl bg-white/90 text-gray-900 font-medium shadow-md animate-fade-in rounded-bl-none drop-shadow-2xl">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  AI is thinking...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input area - fixed at bottom of box */}
        <div className="w-full flex gap-2 px-4 pb-6 pt-2 bg-gradient-to-t from-white/10 via-transparent to-transparent">
          <Input
            className="flex-1 bg-gray-900 border-gray-700 text-white placeholder-gray-400 rounded-full px-6 py-4 text-base shadow-lg"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            autoFocus
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="rounded-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            aria-label="Send message"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
} 