import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

function withTimeout(promise: Promise<any>, ms: number) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini API timed out')), ms)),
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const { text, difficulty = "medium", questionCount = 15, userId } = await request.json()

    if (!text || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (typeof text !== 'string' || text.trim().length < 50) {
      return NextResponse.json({ error: "Transcript is empty or too short for quiz generation." }, { status: 400 })
    }

    let result
    let rawGeminiResponse = ''
    let prompt = ''
    try {
      let inputText = text
      if (inputText.length > 8000) inputText = inputText.slice(0, 8000)
      if (!genAI) {
        return NextResponse.json({ error: "Gemini API key not set." }, { status: 500 });
      }
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      prompt = `
        Create a ${difficulty} difficulty quiz with exactly ${questionCount} multiple choice questions based on the following content:
        
        ${inputText}
        
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
      const aiResult = await withTimeout(model.generateContent(prompt), 30000)
      const response = await aiResult.response
      rawGeminiResponse = await response.text()
      // Clean up the response to extract JSON
      const jsonMatch = rawGeminiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0])
        } catch (err) {
          console.error('Gemini quiz JSON parse error:', err, 'Raw response:', rawGeminiResponse)
          throw new Error('Gemini returned invalid JSON for quiz.')
        }
      } else {
        throw new Error("Invalid AI response format")
      }
    } catch (err) {
      console.error("Gemini quiz error:", err, "Transcript:", text, "Prompt:", prompt, "Raw response:", rawGeminiResponse)
      return NextResponse.json({ error: "Failed to generate quiz from Gemini.", details: err instanceof Error ? err.message : String(err) }, { status: 500 })
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
