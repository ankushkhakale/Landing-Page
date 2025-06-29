import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/lib/supabase-server"

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { userId, subject, currentLevel, learningStyle, recentTopics } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user's learning history
    const { data: quizAttempts } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    const { data: userProgress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .single()

    let recommendations

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const prompt = `
        Generate personalized learning recommendations for a student under 15 based on this information:

        Subject: ${subject || "General"}
        Current Level: ${currentLevel || "Intermediate"}
        Learning Style: ${learningStyle || "Visual"}
        Recent Topics: ${recentTopics?.join(", ") || "None specified"}
        Recent Quiz Performance: ${quizAttempts?.map((q: any) => `${q.score}/${q.total_questions}`).join(", ") || "No recent quizzes"}
        User Progress: Level ${userProgress?.level || 1}, XP: ${userProgress?.xp || 0}

        Return a JSON object with this structure:
        {
          "recommendations": [
            {
              "type": "quiz/flashcards/video/reading/game",
              "title": "Recommendation title",
              "description": "Why this would help",
              "difficulty": "easy/medium/hard",
              "estimatedTime": "15 minutes",
              "priority": "high/medium/low"
            }
          ],
          "nextTopics": [
            {
              "topic": "Topic name",
              "reason": "Why this topic is recommended",
              "prerequisites": ["required knowledge"],
              "resources": ["type of resource"]
            }
          ],
          "studyPlan": {
            "dailyGoal": "30 minutes",
            "weeklyFocus": "Main area to focus on",
            "suggestedSchedule": [
              {
                "day": "Monday",
                "activity": "Activity description",
                "duration": "20 minutes"
              }
            ]
          },
          "motivationalTips": [
            "Encouraging tip 1",
            "Encouraging tip 2"
          ]
        }

        Make recommendations age-appropriate and engaging.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const responseText = response.text()

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Invalid AI response format")
      }
    } else {
      // Fallback recommendations
      recommendations = {
        recommendations: [
          {
            type: "quiz",
            title: "Practice Quiz",
            description: "Test your knowledge with a fun quiz",
            difficulty: "medium",
            estimatedTime: "15 minutes",
            priority: "high"
          }
        ],
        nextTopics: [
          {
            topic: "Advanced Concepts",
            reason: "You're ready for more challenging material",
            prerequisites: ["Basic understanding"],
            resources: ["Interactive lessons", "Practice exercises"]
          }
        ],
        studyPlan: {
          dailyGoal: "30 minutes",
          weeklyFocus: "Building on current knowledge",
          suggestedSchedule: [
            {
              day: "Monday",
              activity: "Review and practice",
              duration: "20 minutes"
            }
          ]
        },
        motivationalTips: [
          "You're making great progress! Keep up the good work!",
          "Remember, every expert was once a beginner"
        ]
      }
    }

    return NextResponse.json({ success: true, recommendations })
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json(
      { error: "Failed to generate recommendations", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 