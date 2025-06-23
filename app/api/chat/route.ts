import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { AICameraMood } from "@/components/ai-camera-mood"

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { message, context, userId } = await request.json()

    if (!message || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let response

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const prompt = `
        You are BrainBuddy, a friendly AI study companion for students under 15. 
        ${context ? `Context: ${context}` : ""}
        
        Student message: ${message}
        
        Respond in a helpful, encouraging, and age-appropriate way. Use emojis and keep explanations simple but accurate.
        Keep responses concise but informative.
      `

      const result = await model.generateContent(prompt)
      const aiResponse = await result.response
      response = aiResponse.text()
    } else {
      // Fallback responses
      const fallbackResponses = [
        "Hi there! I'm BrainBuddy! 🎓 I'm here to help you learn. What subject are you working on today?",
        "That's a great question! 🤔 While I don't have my full AI powers right now, I can tell you that practice makes perfect! Keep studying! ✨",
        "Learning is awesome! 🌟 Remember, every expert was once a beginner. You're doing great by asking questions!",
        "I love your curiosity! 💡 Keep exploring and learning new things. That's what makes you amazing!",
        "Study tip: Break big topics into smaller pieces! 📚 It makes everything easier to understand. You've got this! 💪",
      ]

      response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    }

    return NextResponse.json({ success: true, response })
  } catch (error) {
    console.error("Error in chat:", error)
    return NextResponse.json(
      { error: "Failed to process chat", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
