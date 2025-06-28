import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { text, userId, checkType = "grammar" } = await request.json()

    if (!text || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let grammarCheck

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const prompt = `
        Check the following text for grammar, spelling, and writing improvements. Provide feedback suitable for a student under 15:

        Text: ${text}

        Return a JSON object with this structure:
        {
          "overallScore": 85,
          "issues": [
            {
              "type": "grammar/spelling/punctuation/style",
              "severity": "error/warning/suggestion",
              "message": "What's wrong",
              "suggestion": "How to fix it",
              "position": {
                "start": 10,
                "end": 15
              }
            }
          ],
          "improvements": [
            {
              "category": "clarity/flow/vocabulary",
              "suggestion": "How to improve",
              "example": "Example of improvement"
            }
          ],
          "correctedText": "The corrected version of the text",
          "writingTips": [
            "Tip 1 for better writing",
            "Tip 2 for better writing"
          ]
        }

        Be encouraging and educational in your feedback.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const responseText = response.text()

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        grammarCheck = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Invalid AI response format")
      }
    } else {
      // Fallback grammar check
      grammarCheck = {
        overallScore: 75,
        issues: [
          {
            type: "grammar",
            severity: "suggestion",
            message: "Consider using more descriptive words",
            suggestion: "Try adding adjectives to make your writing more vivid",
            position: { start: 0, end: text.length }
          }
        ],
        improvements: [
          {
            category: "clarity",
            suggestion: "Break long sentences into shorter ones",
            example: "Instead of one long sentence, try two shorter ones"
          }
        ],
        correctedText: text,
        writingTips: [
          "Read your work out loud to catch mistakes",
          "Use a variety of sentence structures"
        ]
      }
    }

    return NextResponse.json({ success: true, grammarCheck })
  } catch (error) {
    console.error("Error checking grammar:", error)
    return NextResponse.json(
      { error: "Failed to check grammar", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 