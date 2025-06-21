import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { text, userId } = await request.json()

    if (!text || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let summary

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const prompt = `
        Create a comprehensive summary of the following content that's appropriate for students under 15:
        
        ${text}
        
        Make it engaging, easy to understand, and highlight the key concepts. Use bullet points and clear sections.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      summary = response.text()
    } else {
      summary = `
# Summary of Your Content

## Key Points:
• This is a sample summary of your uploaded content
• The main topics and concepts would be highlighted here
• Important details would be broken down into easy-to-understand points
• Key learning objectives would be clearly stated

## What You Should Remember:
• Main concept 1: Brief explanation
• Main concept 2: Brief explanation  
• Main concept 3: Brief explanation

## Next Steps:
• Review the key points above
• Try taking a quiz on this content
• Ask BrainBuddy if you have questions!

*Note: This is a sample summary. Add your Gemini API key to get AI-generated summaries.*
      `
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
