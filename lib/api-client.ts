// Client-side API utilities for BrainBuddy

export async function generateQuiz(text: string, difficulty: string, questionCount: number, userId: string) {
  const response = await fetch("/api/generate-quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, difficulty, questionCount, userId }),
  })

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || "Failed to generate quiz")
  }

  return data.quiz
}

export async function generateSummary(text: string, userId: string) {
  const response = await fetch("/api/generate-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, userId }),
  })

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || "Failed to generate summary")
  }

  return data.summary
}

export async function chatWithAI(message: string, userId: string, context?: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, userId, context }),
  })

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || "Failed to process chat")
  }

  return data.response
}

export async function extractTextFromImage(imageData: string, userId: string) {
  const response = await fetch("/api/extract-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageData, userId }),
  })

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || "Failed to extract text")
  }

  return data.text
}

// New NLP API functions
export async function analyzeText(text: string, userId: string, analysisType = "comprehensive") {
  const response = await fetch("/api/nlp/analyze-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, userId, analysisType }),
  })

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || "Failed to analyze text")
  }

  return data.analysis
}

export async function checkGrammar(text: string, userId: string, checkType = "grammar") {
  const response = await fetch("/api/nlp/grammar-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, userId, checkType }),
  })

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || "Failed to check grammar")
  }

  return data.grammarCheck
}

export async function enhanceVocabulary(text: string, userId: string, enhancementType = "synonyms") {
  const response = await fetch("/api/nlp/vocabulary-enhancer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, userId, enhancementType }),
  })

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || "Failed to enhance vocabulary")
  }

  return data.vocabularyEnhancement
}

export async function getLearningRecommendations(
  userId: string,
  subject?: string,
  currentLevel?: string,
  learningStyle?: string,
  recentTopics?: string[]
) {
  const response = await fetch("/api/nlp/learning-recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, subject, currentLevel, learningStyle, recentTopics }),
  })

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || "Failed to get learning recommendations")
  }

  return data.recommendations
}
