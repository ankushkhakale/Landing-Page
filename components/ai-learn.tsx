"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Brain, 
  FileText, 
  MessageCircle, 
  Lightbulb, 
  BookOpen,
  Copy, 
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Clock,
  Target,
  Zap,
  BookMarked,
  Search,
  PenTool,
  Code,
  Languages
} from "lucide-react"

interface AIResponse {
  content: string
  type: string
  timestamp: string
}

export function AILearn() {
  const [activeTab, setActiveTab] = useState("chat")
  const [input, setInput] = useState("")
  const [responses, setResponses] = useState<AIResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedTool, setSelectedTool] = useState("general")
  const [context, setContext] = useState("")

  const tools = [
    { id: "general", name: "General AI", icon: Brain, description: "Ask anything to our AI assistant" },
    { id: "explain", name: "Explain Concept", icon: Lightbulb, description: "Get detailed explanations of complex topics" },
    { id: "summarize", name: "Summarize", icon: FileText, description: "Summarize long texts or articles" },
    { id: "quiz", name: "Generate Quiz", icon: Target, description: "Create quizzes from your content" },
    { id: "translate", name: "Translate", icon: Languages, description: "Translate text between languages" },
    { id: "code", name: "Code Helper", icon: Code, description: "Get help with programming questions" },
    { id: "write", name: "Writing Assistant", icon: PenTool, description: "Improve your writing and essays" },
    { id: "research", name: "Research", icon: Search, description: "Research topics and find information" }
  ]

  const handleSubmit = async () => {
    if (!input.trim()) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          tool: selectedTool,
          context: context
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      const data = await response.json()
      
      const newResponse: AIResponse = {
        content: data.response,
        type: selectedTool,
        timestamp: new Date().toISOString()
      }

      setResponses(prev => [newResponse, ...prev])
      setInput("")

    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const getToolIcon = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId)
    return tool ? tool.icon : Brain
  }

  const getToolName = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId)
    return tool ? tool.name : "General AI"
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Learning Assistant
        </h1>
        <p className="text-muted-foreground">
          Your personal AI tutor for learning, explaining, and exploring any topic
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tools Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Tools
              </CardTitle>
              <CardDescription>
                Choose the right tool for your learning needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTool === tool.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-border hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedTool(tool.id)}
                >
                  <div className="flex items-center gap-3">
                    <tool.icon className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-sm">{tool.name}</h4>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Context Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="w-5 h-5" />
                Context
              </CardTitle>
              <CardDescription>
                Provide additional context for better responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add context, background information, or specific requirements..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                AI Chat
              </CardTitle>
              <CardDescription>
                Ask questions, get explanations, or request help with any topic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  disabled={loading}
                />
                <Button onClick={handleSubmit} disabled={loading || !input}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Ask
                    </>
                  )}
                </Button>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Responses */}
          <div className="space-y-4">
            {responses.map((response, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {React.createElement(getToolIcon(response.type), { className: "w-4 h-4" })}
                      <Badge variant="outline">{getToolName(response.type)}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(response.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(response.content)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(response.content, `ai-response-${index}.txt`)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {response.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-semibold">Smart AI</h3>
            <p className="text-sm text-muted-foreground">
              Advanced AI models for accurate responses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <h3 className="font-semibold">Multiple Tools</h3>
            <p className="text-sm text-muted-foreground">
              Specialized tools for different learning needs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-semibold">Learning Focused</h3>
            <p className="text-sm text-muted-foreground">
              Designed specifically for educational purposes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <h3 className="font-semibold">Conversational</h3>
            <p className="text-sm text-muted-foreground">
              Natural conversation flow for better learning
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 