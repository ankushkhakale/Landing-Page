import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { AICameraMood } from "@/components/ai-camera-mood"

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { message, context, userId, mode } = await request.json()

    if (!message || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let response

    // Strict teach mode: never answer factual/logical questions
    if (mode === 'teach') {
      // Detect topic introduction
      const topicIntro = /(?:ask me about|i(?:'| a)m going to teach you about|i(?:'| a)ll teach you about|let's talk about|let's learn about) ([\w\s\-]+)/i;
      const match = message.match(topicIntro);
      if (match) {
        const topic = match[1].trim();
        if (genAI) {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
          const prompt = `
            The user wants to teach you about the topic: "${topic}".
            You are a curious student. Immediately start by asking a direct, specific, and structured question about this topic (not a vague or generic prompt).
            Use a progressive depth strategy:
            - Level 1: Ask about basic facts or definitions related to the topic.
            - Level 2: Ask about comparisons, functions, or significance.
            - Level 3: Ask about applications or examples.
            - Level 4: Ask a reflective or teach-back prompt.
            Do not summarize or reflect before the user gives content. Do not dominate the conversation. Do not ask generic questions like 'What do you think about this topic?'.
            Example for topic 'Photosynthesis': 'Can you explain how photosynthesis works?'
            Example for topic 'World War II': 'What triggered World War II?'
            Example for topic 'Python Functions': 'What is a function in Python?'
            Respond with only the first direct question for this topic.
          `
          const result = await model.generateContent(prompt)
          const aiResponse = await result.response
          response = aiResponse.text()
        } else {
          return NextResponse.json({ error: "Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables." }, { status: 500 })
        }
        return NextResponse.json({ success: true, response })
      }
      // 1. If the user asks a deep/complex question, politely decline and ask the user to explain
      const deepQuestion = /\b(explain|describe|tell me about|how does|how do|how can|how to|what is|why is|why are|can you teach|can you explain|give me a summary|summarize|define|definition of|how does it work|how do they work|how does this work|how do these work|how does that work|how do those work)\b|\?$/i
      if (deepQuestion.test(message.trim())) {
        const politeDeclines = [
          "I'd love to learn that from you — can you explain it to me?",
          "I'm still a learner in this space. What's your take on it?",
          "Could you walk me through it? I want to understand from your perspective!",
          "I'm curious to hear your explanation!"
        ]
        response = politeDeclines[Math.floor(Math.random() * politeDeclines.length)]
        return NextResponse.json({ success: true, response })
      }
      // 2. If the user message is a basic/universal question, answer briefly and redirect
      const basicQuestions = [
        { pattern: /is the sky blue\??$/i, answer: "Yes, the sky usually looks blue! But why do you think that is?" },
        { pattern: /what'?s 2 ?\+ ?2\??$/i, answer: "2 + 2 is 4! Can you show me how you got that?" },
        { pattern: /is water wet\??$/i, answer: "Water is considered wet! But what do you think?" },
        { pattern: /is earth round\??$/i, answer: "Earth is round! But I'd love to hear your explanation." },
        { pattern: /is fire hot\??$/i, answer: "Yes, fire is hot! But why do you think that is?" },
      ]
      for (const q of basicQuestions) {
        if (q.pattern.test(message.trim())) {
          response = q.answer
          return NextResponse.json({ success: true, response })
        }
      }
      // 3. For factual claims and follow-ups, use progressive depth and topic-aware engagement
      if (genAI) {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const prompt = `
          You are a curious, intelligent student. The user is teaching you a topic. Your job is to:
          - Listen to the user's explanation and identify the topic and subtopic.
          - Acknowledge the user's answer naturally.
          - Ask a logical, direct follow-up question about the topic, using a progressive depth strategy:
            Level 1: Basic facts/definitions
            Level 2: Comparisons, functions, significance
            Level 3: Applications/examples
            Level 4: Reflective/teach-back prompts
          - If the user's claim is clearly incorrect, gently challenge or ask for clarification (e.g., 'Hmm, are you sure? I've heard something different. Can you explain why you think that?')
          - If the user's explanation is unclear, ask thoughtful follow-up questions
          - Occasionally summarize or paraphrase what the user said to show understanding, but only after the user has provided content
          - Encourage the user to elaborate or connect ideas (e.g., 'That's interesting—can you tell me more about that?')
          - Never provide deep or technical explanations; always redirect back to the user for those
          - For very basic/universal questions, you may answer briefly but always redirect back to the user
          - Never act as a teacher or expert; always act as a curious, supportive learner
          - Never ask generic questions like 'What do you think about this topic?'
          - Never summarize before the user gives content
          - Keep responses natural, supportive, and interactive
          User's message: ${message}
          Respond as a student, not a teacher.
        `
        const result = await model.generateContent(prompt)
        const aiResponse = await result.response
        response = aiResponse.text()
      } else {
        return NextResponse.json({ error: "Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables." }, { status: 500 })
      }
      return NextResponse.json({ success: true, response })
    }

    // Normal chat mode
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
      return NextResponse.json({ error: "Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables." }, { status: 500 })
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
