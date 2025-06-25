"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Brain, Send } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

// Add a typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center gap-1 ml-2">
    <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0s]"></span>
    <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
    <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
  </div>
);

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi there! I'm BrainBuddy, your AI study companion! 🎓 I'm here to help you learn, answer questions, and make studying fun! What would you like to learn about today? ✨",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

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
        body: JSON.stringify({
          message: userMessage.content,
          userId: user?.id,
        }),
      })

      const data = await response.json()

      let aiResponseText = "Sorry, I'm having trouble responding right now. Please try again! 😅"

      if (data.success) {
        aiResponseText = data.response
      } else {
        console.error("Chat API error:", data.error)
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseText,
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
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
    <Card className="border-0 shadow-2xl h-[600px] flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 relative overflow-hidden min-h-0">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-2xl shadow-md">
        <CardTitle className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight">BrainBuddy AI</h3>
            <p className="text-blue-100 text-sm">Your AI Study Companion</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-transparent scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100 dark:scrollbar-thumb-blue-900 dark:scrollbar-track-blue-950">
          {messages.map((message, idx) => (
            <div
              key={message.id}
              className={`flex items-end space-x-3 transition-all duration-300 ease-in-out ${
                message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <Avatar className="w-12 h-12 flex-shrink-0 shadow-lg">
                <AvatarFallback
                  className={
                    message.sender === "ai"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xl"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl"
                  }
                >
                  {message.sender === "ai" ? (
                    <Brain className="w-6 h-6" />
                  ) : (
                    user?.user_metadata?.full_name?.charAt(0) || "U"
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-md rounded-3xl px-6 py-4 shadow-md transition-all duration-300 ease-in-out text-base font-medium ${
                  message.sender === "ai"
                    ? "bg-white/80 text-gray-800 dark:bg-blue-900/80 dark:text-blue-100"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                }`}
                style={{ borderBottomLeftRadius: message.sender === "ai" ? 0 : undefined, borderBottomRightRadius: message.sender === "user" ? 0 : undefined }}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-2 ${message.sender === "ai" ? "text-blue-400" : "text-pink-100"}`}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-end space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xl">
                  <Brain className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white/80 dark:bg-blue-900/80 rounded-3xl px-6 py-4 shadow-md flex items-center">
                <TypingIndicator />
                <span className="ml-3 text-blue-400 text-base font-medium">BrainBuddy is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-transparent flex items-end gap-2 sticky bottom-0">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your studies..."
            className="flex-1 px-5 py-3 border-2 border-blue-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 dark:bg-blue-950/60 text-base resize-none shadow-sm transition-all"
            rows={1}
            disabled={isLoading}
            style={{ minHeight: 48, maxHeight: 120 }}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-6 py-3 rounded-full shadow-lg text-white text-xl flex items-center justify-center transition-all duration-200"
            style={{ minWidth: 56, minHeight: 56 }}
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="loader-small">
                <span></span>
              </div>
            ) : (
              <Send className="w-6 h-6" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
