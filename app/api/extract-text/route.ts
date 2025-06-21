import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { imageData, userId } = await request.json()

    if (!imageData || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let extractedText

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const prompt = "Extract all text from this image and format it clearly:"

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData,
            mimeType: "image/jpeg",
          },
        },
      ])
      const response = await result.response
      extractedText = response.text()
    } else {
      extractedText = `
Sample Text Extracted from Image

This is sample text that would normally be extracted from your image using AI.
In a real scenario, this would contain the actual text content from your uploaded image.

Key points that might be in your image:
• Important concepts and definitions
• Study notes and explanations  
• Formulas or equations
• Lists and bullet points

To get actual text extraction from images, please add your Gemini API key to the environment variables.
      `
    }

    return NextResponse.json({ success: true, text: extractedText })
  } catch (error) {
    console.error("Error extracting text:", error)
    return NextResponse.json(
      { error: "Failed to extract text", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
