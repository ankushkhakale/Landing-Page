import { GoogleGenerativeAI } from "@google/generative-ai"

// Check if API key is available
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.warn("GEMINI_API_KEY not found. AI features will require a valid API key to function.")
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
export const geminiModel = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null

export async function generateQuizFromText(text: string, difficulty = "medium", questionCount = 15) {
  if (!geminiModel) {
    throw new Error("Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.");
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
    throw new Error("Failed to generate quiz from content")
  }
}

export async function generateSummary(text: string) {
  if (!geminiModel) {
    throw new Error("Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.");
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
    throw new Error("Failed to generate summary from content")
  }
}

export async function chatWithAI(message: string, context?: string) {
  if (!geminiModel) {
    throw new Error("Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.");
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
    throw new Error("Failed to generate AI response")
  }
}

export async function extractTextFromImage(imageData: string) {
  if (!geminiModel) {
    throw new Error("Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.");
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
    throw new Error("Failed to extract text from image")
  }
}
