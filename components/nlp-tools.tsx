"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Sparkles, 
  FileText, 
  Languages, 
  Brain, 
  Copy, 
  Download,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export function NLPTools() {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTool, setActiveTool] = useState("summarize")

  const tools = [
    {
      key: "summarize",
      label: "Text Summarizer",
      description: "Generate concise summaries of long text",
      icon: FileText,
      placeholder: "Paste your text here to generate a summary..."
    },
    {
      key: "translate",
      label: "Language Translator",
      description: "Translate text between different languages",
      icon: Languages,
      placeholder: "Enter text to translate..."
    },
    {
      key: "analyze",
      label: "Sentiment Analysis",
      description: "Analyze the emotional tone of your text",
      icon: Brain,
      placeholder: "Enter text to analyze sentiment..."
    },
    {
      key: "keywords",
      label: "Keyword Extractor",
      description: "Extract key terms and phrases from text",
      icon: Sparkles,
      placeholder: "Paste text to extract keywords..."
    }
  ]

  const handleProcess = async () => {
    if (!inputText.trim()) return

    setLoading(true)
    setOutputText("")

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock responses based on tool type
      let result = ""
      switch (activeTool) {
        case "summarize":
          result = `Summary of your text:\n\n${inputText.substring(0, 200)}...\n\nThis is a concise summary of the main points in your text.`
          break
        case "translate":
          result = `Translated text (Spanish):\n\n${inputText}\n\n[Translation would appear here]`
          break
        case "analyze":
          result = `Sentiment Analysis Results:\n\n• Overall Sentiment: Positive\n• Confidence: 85%\n• Key Emotions: Joy, Excitement\n• Tone: Friendly and Engaging`
          break
        case "keywords":
          result = `Extracted Keywords:\n\n• Learning\n• Education\n• Technology\n• Innovation\n• Development\n\nKey Phrases:\n• "artificial intelligence"\n• "machine learning"\n• "educational technology"`
          break
        default:
          result = "Processing complete."
      }
      
      setOutputText(result)
    } catch (error) {
      setOutputText("Error processing text. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText)
  }

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTool}-result.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentTool = tools.find(tool => tool.key === activeTool)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          NLP Tools
        </h1>
        <p className="text-muted-foreground">
          Advanced natural language processing tools to enhance your learning experience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Choose Tool
            </CardTitle>
            <CardDescription>
              Select the NLP tool you want to use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tools.map((tool) => {
              const Icon = tool.icon
              const isActive = activeTool === tool.key
              
              return (
                <Button
                  key={tool.key}
                  variant={isActive ? "default" : "outline"}
                  className="w-full justify-start gap-3 h-auto p-4"
                  onClick={() => setActiveTool(tool.key)}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{tool.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {tool.description}
                    </div>
                  </div>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        {/* Input and Output */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentTool && <currentTool.icon className="w-5 h-5" />}
              {currentTool?.label}
            </CardTitle>
            <CardDescription>
              {currentTool?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input Section */}
            <div className="space-y-2">
              <Label htmlFor="input-text">Input Text</Label>
              <Textarea
                id="input-text"
                placeholder={currentTool?.placeholder}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[120px]"
              />
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{inputText.length} characters</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInputText("")}
                  disabled={!inputText}
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Process Button */}
            <Button
              onClick={handleProcess}
              disabled={!inputText.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Process Text
                </>
              )}
            </Button>

            {/* Output Section */}
            {outputText && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Results</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4 min-h-[120px] whitespace-pre-wrap">
                  {outputText}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <h3 className="font-semibold">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Advanced AI models for accurate results
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Languages className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-semibold">Multi-Language</h3>
            <p className="text-sm text-muted-foreground">
              Support for multiple languages
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-semibold">Fast Processing</h3>
            <p className="text-sm text-muted-foreground">
              Quick results in seconds
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Download className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <h3 className="font-semibold">Export Ready</h3>
            <p className="text-sm text-muted-foreground">
              Download and share results
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 