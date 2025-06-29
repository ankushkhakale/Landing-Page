"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Brain, Send } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  ChatInput,
  ChatInputTextArea,
  ChatInputSubmit,
} from "@/components/ui/chat-input";
import { motion } from "framer-motion";
import { RadialProgress } from "@/components/ui/radial-progress";
import { AIMoodRadar } from "@/components/ui/ai-mood-radar";
import { LearningInsights } from "@/components/ui/learning-insights";
import { GoalTracker } from "@/components/ui/goal-tracker";
import { CommandPalette } from "@/components/ui/command-palette";

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
    <div className="relative min-h-[600px] h-full w-full flex flex-col justify-end bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] bg-fixed overflow-hidden font-sans">
      {/* Floating glass header */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 drop-shadow-2xl">
        <span className="flex items-center gap-2 text-sky-300 font-bold text-lg animate-pulse">
          <span className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8] animate-pulse" />
          Learning Mode: Active
        </span>
        <div className="flex items-center gap-2">
          <span className="text-slate-200 font-semibold">Current Focus:</span>
          <span className="text-purple-300 font-bold animate-pulse">Physics: Newton's Laws</span>
          <RadialProgress value={72} size={48} color="#38BDF8" icon={null} />
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-purple-400/20 text-purple-200 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><span>🔥</span> 3d Streak</span>
          <span className="bg-sky-400/20 text-sky-200 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><span>⭐</span> 120 XP</span>
        </div>
          </div>
      {/* Radial progress top-right */}
      <div className="fixed top-8 right-8 z-50">
        <RadialProgress value={72} size={64} color="#38BDF8" icon={null} />
          </div>
      {/* AI Mood Radar */}
      <AIMoodRadar emoji="😃" mood="Curious" color="#38BDF8" />
      {/* Learning Insights Feed */}
      <LearningInsights />
      {/* Chat area */}
      <div className="flex-1 w-full px-2 md:px-0 flex flex-col justify-end pt-40">
        <div className="flex-1 overflow-y-auto px-0 md:px-8 pb-36 space-y-6">
          {messages.map((message, idx) => (
            <motion.div
              key={message.id}
              initial={{ y: 30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04, type: "spring", stiffness: 200, damping: 20 }}
              className={`flex items-end ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "ai" && (
                <motion.div
                  className="absolute left-0 ml-8 -mt-8 z-30 flex items-center justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 + idx * 0.04, type: "spring" }}
                >
                  <div className="w-12 h-12 bg-sky-400/80 rounded-full flex items-center justify-center shadow-lg animate-pulse border-4 border-white/30">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                </motion.div>
              )}
              <div
                className={`max-w-lg px-6 py-4 rounded-3xl text-base font-medium shadow-md transition-all duration-200 animate-pop-in whitespace-pre-wrap
                  ${message.sender === "ai"
                    ? "bg-white/90 text-gray-900 rounded-bl-none ml-20 drop-shadow-2xl"
                    : "bg-sky-400/90 text-gray-900 rounded-br-none mr-2 drop-shadow-2xl"}
                `}
              >
                {message.content}
                <span className="block text-xs mt-1 text-gray-500 text-right">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex items-end justify-start"
            >
              <div className="max-w-lg px-6 py-4 rounded-3xl bg-white/90 text-gray-900 font-medium shadow-md animate-fade-in rounded-bl-none ml-20 drop-shadow-2xl">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                  BrainBuddy is thinking...
                </span>

              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* Goal Tracker Bar */}
      <GoalTracker active={1} />
      {/* Input area - fixed at bottom */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center bg-gradient-to-t from-black/60 via-[#1E293B]/40 to-transparent pb-4 pt-6 z-50">
        <div className="w-full max-w-2xl px-4">
          <ChatInput
              value={input}
            onChange={e => setInput(e.target.value)}
            onSubmit={sendMessage}
            loading={isLoading}
            className="bg-white/90 rounded-full shadow-lg flex-row items-center px-4 py-2 border-0"
            variant="unstyled"
          >
            <ChatInputTextArea
              placeholder="Ask me anything about your studies..."
              className="bg-transparent border-0 text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none px-0 py-2"
            />
            <ChatInputSubmit className="ml-2 bg-sky-400 hover:bg-sky-500 text-gray-900 ring-2 ring-[#38BDF8]/40" />
          </ChatInput>

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
      </div>
      {/* Command Palette */}
      <CommandPalette />
    </div>
  )
}
