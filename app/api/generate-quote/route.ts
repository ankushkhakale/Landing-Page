import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

const fallbackQuotes = [
  "Progress, not perfection! Every step counts.",
  "Small steps every day lead to big results.",
  "Keep going! You're getting better every day.",
  "Learning is a journey, not a race.",
  "Mistakes are proof that you are trying!",
  "Celebrate your progress, no matter how small.",
  "Stay curious and keep moving forward!",
  "Every expert was once a beginner.",
  "Believe in yourself and your progress!",
  "Success is the sum of small efforts repeated day in and day out."
]

export async function POST(request: NextRequest) {
  try {
    const { topic = "progress" } = await request.json()
    let quote: string

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      const prompt = `Give me a short, highly motivating, progress-related quote for students under 15. Make it playful, positive, and never repeat the same quote. Topic: ${topic}`
      const result = await model.generateContent(prompt)
      const response = await result.response
      quote = response.text().replace(/^"|"$/g, "").trim()
      if (!quote || quote.length < 5) {
        quote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
      }
    } else {
      quote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
    }

    return NextResponse.json({ quote })
  } catch (error) {
    return NextResponse.json({ quote: fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)] })
  }
} 