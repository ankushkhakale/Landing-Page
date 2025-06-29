import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { text, userId, analysisType = "comprehensive" } = await request.json()

    if (!text || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let analysis

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const prompt = `
        Analyze the following text for a student under 15 years old. Provide a comprehensive analysis in JSON format:

        Text: ${text}

        Return a JSON object with this structure:
        {
          "sentiment": {
            "overall": "positive/negative/neutral",
            "confidence": 0.85,
            "emotions": ["excited", "confused", "interested"]
          },
          "complexity": {
            "readingLevel": "elementary/middle/high",
            "difficultyScore": 0.7,
            "suggestedAge": "8-10/11-13/14-15"
          },
          "keyConcepts": [
            {
              "concept": "concept name",
              "importance": "high/medium/low",
              "explanation": "simple explanation"
            }
          ],
          "vocabulary": {
            "difficultWords": ["word1", "word2"],
            "definitions": {
              "word1": "simple definition",
              "word2": "simple definition"
            },
            "suggestedReplacements": {
              "word1": "easier alternative"
            }
          },
          "learningRecommendations": [
            {
              "type": "quiz/flashcards/summary/visual",
              "reason": "why this would help",
              "priority": "high/medium/low"
            }
          ],
          "comprehensionQuestions": [
            {
              "question": "What is the main idea?",
              "type": "main-idea/detail/inference"
            }
          ]
        }

        Make the analysis age-appropriate and educational.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const responseText = response.text()

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Invalid AI response format")
      }
    } else {
      // Fallback analysis
      analysis = {
        sentiment: {
          overall: "neutral",
          confidence: 0.5,
          emotions: ["neutral"]
        },
        complexity: {
          readingLevel: "middle",
          difficultyScore: 0.5,
          suggestedAge: "11-13"
        },
        keyConcepts: [
          {
            concept: "Main Topic",
            importance: "high",
            explanation: "This is the main subject being discussed"
          }
        ],
        vocabulary: {
          difficultWords: [],
          definitions: {},
          suggestedReplacements: {}
        },
        learningRecommendations: [
          {
            type: "summary",
            reason: "To understand the main points",
            priority: "high"
          }
        ],
        comprehensionQuestions: [
          {
            question: "What is the main topic of this text?",
            type: "main-idea"
          }
        ]
      }
    }

    return NextResponse.json({ success: true, analysis })
  } catch (error) {
    console.error("Error analyzing text:", error)
    return NextResponse.json(
      { error: "Failed to analyze text", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 