import { GoogleGenerativeAI } from "@google/generative-ai"

// Check if API key is available
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.warn("GEMINI_API_KEY not found. AI features will use fallback responses.")
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
export const geminiModel = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null

export async function generateQuizFromText(text: string, difficulty = "medium", questionCount = 15) {
  if (!geminiModel) {
    // Fallback quiz for when API key is not available
    return {
      title: `Sample ${difficulty} Quiz`,
      questions: Array.from({ length: Math.min(questionCount, 5) }, (_, i) => ({
        question: `Sample question ${i + 1} about the content (${difficulty} level)`,
        options: ["This is option A", "This is option B", "This is option C", "This is option D"],
        correctAnswer: i % 4,
        explanation: `This is a sample explanation for question ${i + 1}.`,
      })),
    }
  }

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

  try {
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean up the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error("Invalid response format")
  } catch (error) {
    console.error("Error generating quiz:", error)
    // Return fallback quiz
    return {
      title: `${difficulty} Quiz`,
      questions: [
        {
          question: "What is the main topic discussed in the content?",
          options: ["Topic A", "Topic B", "Topic C", "Topic D"],
          correctAnswer: 0,
          explanation: "This is based on the main theme of your uploaded content.",
        },
      ],
    }
  }
}

export async function generateSummary(text: string) {
  if (!geminiModel) {
    return "This is a sample summary of your content. To get AI-generated summaries, please add your Gemini API key to the environment variables."
  }

  const prompt = `
    Create a comprehensive summary of the following content that's appropriate for students under 15:
    
    ${text}
    
    Make it engaging, easy to understand, and highlight the key concepts. Use bullet points and clear sections.
  `

  try {
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error generating summary:", error)
    return "This is a sample summary of your content. The AI service encountered an error, but your content was processed successfully."
  }
}

export async function chatWithAI(message: string, context?: string) {
  if (!geminiModel) {
    return "Hi there! I'm BrainBuddy, but I need an API key to chat with you properly. For now, I can tell you that learning is awesome and you're doing great! 🎓✨"
  }

  const prompt = `
    You are BrainBuddy, a friendly AI study companion for students under 15. 
    ${context ? `Context: ${context}` : ""}
    
    Student message: ${message}
    
    Respond in a helpful, encouraging, and age-appropriate way. Use emojis and keep explanations simple but accurate.
  `

  try {
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error in AI chat:", error)
    return "I'm having trouble connecting right now, but I'm here to help! Try asking me something about your studies and I'll do my best to help! 😊"
  }
}

export async function extractTextFromImage(imageData: string) {
  if (!geminiModel) {
    return "Sample text extracted from image. To get actual text extraction, please add your Gemini API key."
  }

  const prompt = "Extract all text from this image and format it clearly:"

  try {
    const result = await geminiModel.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: "image/jpeg",
        },
      },
    ])
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error extracting text from image:", error)
    return "Sample text content extracted from your image. The AI service encountered an error, but your image was processed."
  }
}
