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
    const { text, userId } = await request.json()

    if (!text || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (typeof text !== 'string' || text.trim().length < 50) {
      return NextResponse.json({ error: "Transcript is empty or too short for summary generation." }, { status: 400 })
    }

    let summary = ''
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
        Create a comprehensive summary of the following content that's appropriate for students under 15:
        
        ${inputText}
        
        Make it engaging, easy to understand, and highlight the key concepts. Use bullet points and clear sections.
      `
      const result = await withTimeout(model.generateContent(prompt), 30000)
      const response = await result.response
      rawGeminiResponse = await response.text()
      if (!rawGeminiResponse) throw new Error('Gemini returned empty response')
      summary = rawGeminiResponse
    } catch (err) {
      console.error("Gemini summary error:", err, "Transcript:", text, "Prompt:", prompt, "Raw response:", rawGeminiResponse)
      return NextResponse.json({ error: "Failed to generate summary from Gemini.", details: err instanceof Error ? err.message : String(err) }, { status: 500 })
    }
    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error("Error generating summary:", error)
    return NextResponse.json(
      { error: "Failed to generate summary", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
