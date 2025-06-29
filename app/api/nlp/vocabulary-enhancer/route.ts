import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { text, userId, enhancementType = "synonyms" } = await request.json()

    if (!text || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let vocabularyEnhancement

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const prompt = `
        Enhance the vocabulary in the following text for a student under 15. Provide age-appropriate suggestions:

        Text: ${text}

        Return a JSON object with this structure:
        {
          "enhancedText": "Text with improved vocabulary",
          "wordSuggestions": [
            {
              "originalWord": "word",
              "suggestions": [
                {
                  "word": "suggested word",
                  "definition": "simple definition",
                  "difficulty": "easy/medium/hard",
                  "context": "when to use it"
                }
              ]
            }
          ],
          "newVocabulary": [
            {
              "word": "new word",
              "definition": "simple definition",
              "example": "example sentence",
              "category": "adjective/verb/noun/adverb"
            }
          ],
          "learningTips": [
            "Tip for learning new words",
            "Another tip"
          ],
          "difficultyLevel": "beginner/intermediate/advanced"
        }

        Focus on words that are challenging but appropriate for the student's age.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const responseText = response.text()

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        vocabularyEnhancement = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Invalid AI response format")
      }
    } else {
      // Fallback vocabulary enhancement
      vocabularyEnhancement = {
        enhancedText: text,
        wordSuggestions: [
          {
            originalWord: "good",
            suggestions: [
              {
                word: "excellent",
                definition: "very good",
                difficulty: "easy",
                context: "when something is really good"
              }
            ]
          }
        ],
        newVocabulary: [
          {
            word: "excellent",
            definition: "very good or outstanding",
            example: "You did an excellent job on your homework!",
            category: "adjective"
          }
        ],
        learningTips: [
          "Try using new words in your daily conversations",
          "Write down new words and their meanings"
        ],
        difficultyLevel: "beginner"
      }
    }

    return NextResponse.json({ success: true, vocabularyEnhancement })
  } catch (error) {
    console.error("Error enhancing vocabulary:", error)
    return NextResponse.json(
      { error: "Failed to enhance vocabulary", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 