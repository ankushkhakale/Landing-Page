import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { text, difficulty = "medium", questionCount = 15, userId } = await request.json()

    if (!text || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let result

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const prompt = `
        Create a ${difficulty} difficulty quiz with exactly ${questionCount} multiple choice questions based on the following content:
        
        ${text}
        
        Format the response as a JSON object with this structure:
        {
          "title": "Quiz Title",
          "questions": [
            {
              "question": "Question text",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": 0,
              "explanation": "Why this answer is correct"
            }
          ]
        }
        
        Make sure questions are educational, age-appropriate for students under 15, and test understanding of key concepts.
      `

      const aiResult = await model.generateContent(prompt)
      const response = await aiResult.response
      const responseText = response.text()

      // Clean up the response to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Invalid AI response format")
      }
    } else {
      // Fallback quiz when no API key
      result = {
        title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quiz`,
        questions: Array.from({ length: Math.min(questionCount, 5) }, (_, i) => ({
          question: `Sample question ${i + 1} about the content (${difficulty} level)`,
          options: [
            `This is option A for question ${i + 1}`,
            `This is option B for question ${i + 1}`,
            `This is option C for question ${i + 1}`,
            `This is option D for question ${i + 1}`,
          ],
          correctAnswer: i % 4,
          explanation: `This is a sample explanation for question ${i + 1}. In a real scenario, this would explain why the correct answer is right based on your content.`,
        })),
      }
    }

    return NextResponse.json({ success: true, quiz: result })
  } catch (error) {
    console.error("Error generating quiz:", error)
    return NextResponse.json(
      { error: "Failed to generate quiz", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
