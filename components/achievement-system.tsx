"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Flame, Target, BookOpen, Zap, Crown, Award } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: (progress: any) => boolean
  xpReward: number
  category: string
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_quiz",
    name: "First Steps",
    description: "Complete your first quiz",
    icon: "trophy",
    condition: (progress) => progress.total_quizzes_completed >= 1,
    xpReward: 50,
    category: "learning",
  },
  {
    id: "speed_learner",
    name: "Speed Learner",
    description: "Complete 5 quizzes in one day",
    icon: "zap",
    condition: (progress) => progress.daily_quizzes >= 5,
    xpReward: 100,
    category: "performance",
  },
  {
    id: "streak_master",
    name: "Streak Master",
    description: "Maintain a 7-day learning streak",
    icon: "flame",
    condition: (progress) => progress.streak_days >= 7,
    xpReward: 200,
    category: "consistency",
  },
  {
    id: "knowledge_seeker",
    name: "Knowledge Seeker",
    description: "Upload 10 different files",
    icon: "book",
    condition: (progress) => progress.files_uploaded >= 10,
    xpReward: 150,
    category: "exploration",
  },
  {
    id: "level_up",
    name: "Level Up",
    description: "Reach Level 5",
    icon: "crown",
    condition: (progress) => progress.level >= 5,
    xpReward: 300,
    category: "milestone",
  },
  {
    id: "perfect_score",
    name: "Perfect Score",
    description: "Get 100% on any quiz",
    icon: "star",
    condition: (progress) => progress.perfect_scores >= 1,
    xpReward: 100,
    category: "performance",
  },
  {
    id: "study_time",
    name: "Dedicated Learner",
    description: "Study for 10 hours total",
    icon: "target",
    condition: (progress) => progress.total_study_time_minutes >= 600,
    xpReward: 250,
    category: "dedication",
  },
]

export function AchievementSystem() {
  const [userProgress, setUserProgress] = useState<any>(null)
  const [earnedAchievements, setEarnedAchievements] = useState<string[]>([])
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchUserProgress()
      fetchEarnedAchievements()
    }
  }, [user])

  useEffect(() => {
    if (userProgress) {
      checkForNewAchievements()
    }
  }, [userProgress])

  const fetchUserProgress = async () => {
    try {
      const { data, error } = await supabase.from("user_progress").select("*").eq("user_id", user?.id).single()

      if (error) throw error

      // Get additional stats
      const { data: quizData } = await supabase
        .from("quiz_attempts")
        .select("score, total_questions, completed_at")
        .eq("user_id", user?.id)

      const { data: fileData } = await supabase.from("uploaded_files").select("id").eq("user_id", user?.id)

      const today = new Date().toDateString()
      const dailyQuizzes = quizData?.filter((quiz) => new Date(quiz.completed_at).toDateString() === today).length || 0

      const perfectScores = quizData?.filter((quiz) => quiz.score === quiz.total_questions).length || 0

      setUserProgress({
        ...data,
        daily_quizzes: dailyQuizzes,
        perfect_scores: perfectScores,
        files_uploaded: fileData?.length || 0,
      })
    } catch (error) {
      console.error("Error fetching user progress:", error)
    }
  }

  const fetchEarnedAchievements = async () => {
    try {
      const { data, error } = await supabase.from("achievements").select("achievement_type").eq("user_id", user?.id)

      if (error) throw error

      setEarnedAchievements(data.map((a) => a.achievement_type))
    } catch (error) {
      console.error("Error fetching achievements:", error)
    }
  }

  const checkForNewAchievements = async () => {
    const newlyEarned: Achievement[] = []

    for (const achievement of ACHIEVEMENTS) {
      if (!earnedAchievements.includes(achievement.id) && achievement.condition(userProgress)) {
        newlyEarned.push(achievement)

        // Save to database
        try {
          await supabase.from("achievements").insert({
            user_id: user?.id,
            achievement_type: achievement.id,
            achievement_name: achievement.name,
            description: achievement.description,
          })

          // Award XP
          await supabase.rpc("update_user_progress", {
            user_id: user?.id,
            xp_to_add: achievement.xpReward,
          })
        } catch (error) {
          console.error("Error saving achievement:", error)
        }
      }
    }

    if (newlyEarned.length > 0) {
      setNewAchievements(newlyEarned)
      setEarnedAchievements((prev) => [...prev, ...newlyEarned.map((a) => a.id)])

      // Show achievement notification
      setTimeout(() => setNewAchievements([]), 5000)
    }
  }

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      trophy: Trophy,
      star: Star,
      flame: Flame,
      target: Target,
      book: BookOpen,
      zap: Zap,
      crown: Crown,
      award: Award,
    }
    const Icon = icons[iconName] || Trophy
    return <Icon className="w-6 h-6" />
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      learning: "from-blue-500 to-cyan-500",
      performance: "from-purple-500 to-pink-500",
      consistency: "from-orange-500 to-red-500",
      exploration: "from-green-500 to-emerald-500",
      milestone: "from-yellow-500 to-orange-500",
      dedication: "from-indigo-500 to-purple-500",
    }
    return colors[category] || "from-gray-500 to-gray-600"
  }

  return (
    <>
      {/* Achievement Notifications */}
      {newAchievements.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {newAchievements.map((achievement) => (
            <Card
              key={achievement.id}
              className="border-0 shadow-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-bounce"
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    {getIcon(achievement.icon)}
                  </div>
                  <div>
                    <p className="font-bold">Achievement Unlocked!</p>
                    <p className="text-sm">{achievement.name}</p>
                    <p className="text-xs text-yellow-100">+{achievement.xpReward} XP</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ACHIEVEMENTS.map((achievement) => {
          const isEarned = earnedAchievements.includes(achievement.id)
          const canEarn = userProgress && achievement.condition(userProgress)

          return (
            <Card
              key={achievement.id}
              className={`border-0 shadow-xl transition-all ${
                isEarned
                  ? `bg-gradient-to-br ${getCategoryColor(achievement.category)} text-white`
                  : canEarn
                    ? "bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300"
                    : "bg-gray-100"
              }`}
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 ${
                    isEarned ? "bg-white/20" : canEarn ? "bg-yellow-200" : "bg-gray-200"
                  }`}
                >
                  <div className={isEarned ? "text-white" : canEarn ? "text-yellow-600" : "text-gray-400"}>
                    {getIcon(achievement.icon)}
                  </div>
                </div>

                <h3
                  className={`text-xl font-bold mb-2 ${isEarned ? "text-white" : canEarn ? "text-yellow-800" : "text-gray-600"}`}
                >
                  {achievement.name}
                </h3>

                <p
                  className={`text-sm mb-4 ${isEarned ? "text-white/80" : canEarn ? "text-yellow-700" : "text-gray-500"}`}
                >
                  {achievement.description}
                </p>

                <Badge
                  className={
                    isEarned
                      ? "bg-white/20 text-white border-white/30"
                      : canEarn
                        ? "bg-yellow-200 text-yellow-800 border-yellow-300"
                        : "bg-gray-200 text-gray-600"
                  }
                >
                  {isEarned ? "Earned" : canEarn ? "Ready to Earn!" : "Locked"}
                </Badge>

                {isEarned && <p className="text-xs text-white/60 mt-2">+{achievement.xpReward} XP</p>}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
