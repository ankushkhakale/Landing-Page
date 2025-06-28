"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  BookOpen, 
  CheckCircle, 
  Lightbulb, 
  MessageSquare, 
  Sparkles, 
  Target, 
  TrendingUp,
  Loader2,
  AlertCircle,
  Star
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { 
  analyzeText, 
  checkGrammar, 
  enhanceVocabulary, 
  getLearningRecommendations 
} from "@/lib/api-client"

interface TextAnalysis {
  sentiment: {
    overall: string
    confidence: number
    emotions: string[]
  }
  complexity: {
    readingLevel: string
    difficultyScore: number
    suggestedAge: string
  }
  keyConcepts: Array<{
    concept: string
    importance: string
    explanation: string
  }>
  vocabulary: {
    difficultWords: string[]
    definitions: Record<string, string>
    suggestedReplacements: Record<string, string>
  }
  learningRecommendations: Array<{
    type: string
    reason: string
    priority: string
  }>
  comprehensionQuestions: Array<{
    question: string
    type: string
  }>
}

interface GrammarCheck {
  overallScore: number
  issues: Array<{
    type: string
    severity: string
    message: string
    suggestion: string
    position: { start: number; end: number }
  }>
  improvements: Array<{
    category: string
    suggestion: string
    example: string
  }>
  correctedText: string
  writingTips: string[]
}

interface VocabularyEnhancement {
  enhancedText: string
  wordSuggestions: Array<{
    originalWord: string
    suggestions: Array<{
      word: string
      definition: string
      difficulty: string
      context: string
    }>
  }>
  newVocabulary: Array<{
    word: string
    definition: string
    example: string
    category: string
  }>
  learningTips: string[]
  difficultyLevel: string
}

interface LearningRecommendations {
  recommendations: Array<{
    type: string
    title: string
    description: string
    difficulty: string
    estimatedTime: string
    priority: string
  }>
  nextTopics: Array<{
    topic: string
    reason: string
    prerequisites: string[]
    resources: string[]
  }>
  studyPlan: {
    dailyGoal: string
    weeklyFocus: string
    suggestedSchedule: Array<{
      day: string
      activity: string
      duration: string
    }>
  }
  motivationalTips: string[]
}

export function NLPTools() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("analysis")
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Analysis results
  const [textAnalysis, setTextAnalysis] = useState<TextAnalysis | null>(null)
  const [grammarCheck, setGrammarCheck] = useState<GrammarCheck | null>(null)
  const [vocabularyEnhancement, setVocabularyEnhancement] = useState<VocabularyEnhancement | null>(null)
  const [learningRecommendations, setLearningRecommendations] = useState<LearningRecommendations | null>(null)

  const handleAnalyzeText = async () => {
    if (!inputText.trim() || !user?.id) return

    setIsLoading(true)
    setError("")

    try {
      const analysis = await analyzeText(inputText, user.id)
      setTextAnalysis(analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze text")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckGrammar = async () => {
    if (!inputText.trim() || !user?.id) return

    setIsLoading(true)
    setError("")

    try {
      const check = await checkGrammar(inputText, user.id)
      setGrammarCheck(check)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check grammar")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnhanceVocabulary = async () => {
    if (!inputText.trim() || !user?.id) return

    setIsLoading(true)
    setError("")

    try {
      const enhancement = await enhanceVocabulary(inputText, user.id)
      setVocabularyEnhancement(enhancement)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enhance vocabulary")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetRecommendations = async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError("")

    try {
      const recommendations = await getLearningRecommendations(user.id)
      setLearningRecommendations(recommendations)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get recommendations")
    } finally {
      setIsLoading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-600"
      case "negative": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error": return "text-red-600"
      case "warning": return "text-yellow-600"
      default: return "text-blue-600"
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">BrainBuddy NLP Tools</h1>
        <p className="text-muted-foreground">
          Advanced AI-powered tools to help you learn better! 🚀
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Text Analysis
          </TabsTrigger>
          <TabsTrigger value="grammar" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Grammar Check
          </TabsTrigger>
          <TabsTrigger value="vocabulary" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Vocabulary
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Text Analysis
              </CardTitle>
              <CardDescription>
                Analyze your text for sentiment, complexity, key concepts, and learning recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your text here to analyze..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[120px]"
              />
              <Button 
                onClick={handleAnalyzeText} 
                disabled={isLoading || !inputText.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Analyze Text
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {textAnalysis && (
                <div className="space-y-6 mt-6">
                  {/* Sentiment Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Badge className={getSentimentColor(textAnalysis.sentiment.overall)}>
                          {textAnalysis.sentiment.overall}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Confidence: {Math.round(textAnalysis.sentiment.confidence * 100)}%
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {textAnalysis.sentiment.emotions.map((emotion, index) => (
                          <Badge key={index} variant="outline">
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Complexity Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Reading Complexity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Reading Level:</span>
                          <Badge>{textAnalysis.complexity.readingLevel}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Suggested Age:</span>
                          <Badge variant="outline">{textAnalysis.complexity.suggestedAge}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Difficulty Score:</span>
                            <span>{Math.round(textAnalysis.complexity.difficultyScore * 100)}%</span>
                          </div>
                          <Progress value={textAnalysis.complexity.difficultyScore * 100} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Concepts */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Key Concepts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {textAnalysis.keyConcepts.map((concept, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{concept.concept}</span>
                              <Badge variant={concept.importance === "high" ? "default" : "secondary"}>
                                {concept.importance}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{concept.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vocabulary */}
                  {textAnalysis.vocabulary.difficultWords.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Vocabulary Help</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {textAnalysis.vocabulary.difficultWords.map((word, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="font-semibold text-red-600">{word}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {textAnalysis.vocabulary.definitions[word]}
                              </div>
                              {textAnalysis.vocabulary.suggestedReplacements[word] && (
                                <div className="text-sm text-blue-600 mt-1">
                                  Try: {textAnalysis.vocabulary.suggestedReplacements[word]}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Learning Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Learning Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {textAnalysis.learningRecommendations.map((rec, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold capitalize">{rec.type}</span>
                                <Badge variant={rec.priority === "high" ? "default" : "secondary"}>
                                  {rec.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{rec.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grammar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Grammar & Writing Check
              </CardTitle>
              <CardDescription>
                Check your writing for grammar, spelling, and style improvements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your text here to check grammar..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[120px]"
              />
              <Button 
                onClick={handleCheckGrammar} 
                disabled={isLoading || !inputText.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Check Grammar
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {grammarCheck && (
                <div className="space-y-6 mt-6">
                  {/* Overall Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Writing Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center space-y-3">
                        <div className="text-3xl font-bold text-blue-600">
                          {grammarCheck.overallScore}/100
                        </div>
                        <Progress value={grammarCheck.overallScore} className="w-full" />
                        <p className="text-sm text-muted-foreground">
                          {grammarCheck.overallScore >= 80 ? "Excellent writing!" : 
                           grammarCheck.overallScore >= 60 ? "Good work, keep improving!" : 
                           "Let's work on improving your writing skills!"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Issues */}
                  {grammarCheck.issues.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Issues Found</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {grammarCheck.issues.map((issue, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getSeverityColor(issue.severity)}>
                                  {issue.severity}
                                </Badge>
                                <Badge variant="outline">{issue.type}</Badge>
                              </div>
                              <p className="text-sm font-medium mb-1">{issue.message}</p>
                              <p className="text-sm text-blue-600">{issue.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Improvements */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Writing Improvements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {grammarCheck.improvements.map((improvement, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="w-4 h-4 text-yellow-600" />
                              <Badge variant="outline">{improvement.category}</Badge>
                            </div>
                            <p className="text-sm font-medium mb-1">{improvement.suggestion}</p>
                            <p className="text-sm text-muted-foreground">{improvement.example}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Writing Tips */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Writing Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {grammarCheck.writingTips.map((tip, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Star className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Corrected Text */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Improved Version</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{grammarCheck.correctedText}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vocabulary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Vocabulary Enhancement
              </CardTitle>
              <CardDescription>
                Improve your vocabulary with better word choices and learn new words
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your text here to enhance vocabulary..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[120px]"
              />
              <Button 
                onClick={handleEnhanceVocabulary} 
                disabled={isLoading || !inputText.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enhance Vocabulary
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {vocabularyEnhancement && (
                <div className="space-y-6 mt-6">
                  {/* Enhanced Text */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Enhanced Version</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{vocabularyEnhancement.enhancedText}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Word Suggestions */}
                  {vocabularyEnhancement.wordSuggestions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Word Suggestions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {vocabularyEnhancement.wordSuggestions.map((suggestion, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="font-semibold text-red-600 mb-2">
                                "{suggestion.originalWord}"
                              </div>
                              <div className="space-y-2">
                                {suggestion.suggestions.map((word, wordIndex) => (
                                  <div key={wordIndex} className="pl-4 border-l-2 border-blue-200">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-blue-600">{word.word}</span>
                                      <Badge variant="outline">{word.difficulty}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">{word.definition}</p>
                                    <p className="text-xs text-blue-600">{word.context}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* New Vocabulary */}
                  {vocabularyEnhancement.newVocabulary.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">New Words to Learn</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {vocabularyEnhancement.newVocabulary.map((word, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">{word.word}</span>
                                <Badge variant="outline">{word.category}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{word.definition}</p>
                              <p className="text-sm italic text-blue-600">"{word.example}"</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Learning Tips */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Learning Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {vocabularyEnhancement.learningTips.map((tip, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Difficulty Level */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Vocabulary Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className="text-lg px-4 py-2">
                        {vocabularyEnhancement.difficultyLevel}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Personalized Learning Recommendations
              </CardTitle>
              <CardDescription>
                Get AI-powered recommendations based on your learning progress and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGetRecommendations} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting Recommendations...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Get Recommendations
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {learningRecommendations && (
                <div className="space-y-6 mt-6">
                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommended Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {learningRecommendations.recommendations.map((rec, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{rec.title}</span>
                                <Badge variant={rec.priority === "high" ? "default" : "secondary"}>
                                  {rec.priority}
                                </Badge>
                              </div>
                              <Badge variant="outline">{rec.estimatedTime}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">{rec.type}</Badge>
                              <Badge variant="outline">{rec.difficulty}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Next Topics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Next Topics to Explore</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {learningRecommendations.nextTopics.map((topic, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="font-semibold mb-2">{topic.topic}</div>
                            <p className="text-sm text-muted-foreground mb-2">{topic.reason}</p>
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-blue-600">Prerequisites:</div>
                              <div className="flex flex-wrap gap-1">
                                {topic.prerequisites.map((prereq, prereqIndex) => (
                                  <Badge key={prereqIndex} variant="outline" className="text-xs">
                                    {prereq}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-1 mt-2">
                              <div className="text-xs font-medium text-green-600">Resources:</div>
                              <div className="flex flex-wrap gap-1">
                                {topic.resources.map((resource, resourceIndex) => (
                                  <Badge key={resourceIndex} variant="secondary" className="text-xs">
                                    {resource}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Study Plan */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personalized Study Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <div>
                            <div className="font-semibold">Daily Goal</div>
                            <div className="text-sm text-muted-foreground">{learningRecommendations.studyPlan.dailyGoal}</div>
                          </div>
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                          <div className="font-semibold mb-1">Weekly Focus</div>
                          <div className="text-sm text-muted-foreground">{learningRecommendations.studyPlan.weeklyFocus}</div>
                        </div>

                        <div className="space-y-2">
                          <div className="font-semibold">Suggested Schedule:</div>
                          {learningRecommendations.studyPlan.suggestedSchedule.map((schedule, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <span className="font-medium">{schedule.day}</span>
                              <div className="text-right">
                                <div className="text-sm">{schedule.activity}</div>
                                <div className="text-xs text-muted-foreground">{schedule.duration}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Motivational Tips */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Motivational Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {learningRecommendations.motivationalTips.map((tip, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 