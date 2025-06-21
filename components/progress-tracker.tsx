"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Flame, Trophy, Target, BookOpen, TrendingUp, Calendar, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"

interface UserProgress {
  xp_points: number
  level: number
  streak_days: number
  total_quizzes_completed: number
  total_study_time_minutes: number
  last_activity_date: string
}

interface SubjectProgress {
  subject_name: string
  progress_percentage: number
  quizzes_completed: number
  total_questions_answered: number
  correct_answers: number
  last_activity: string
}

export function ProgressTracker() {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([])
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchProgressData()
    }
  }, [user])

  const fetchProgressData = async () => {
    try {
      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user?.id)
        .single()

      if (progressError && progressError.code !== "PGRST116") {
        console.error("Error fetching user progress:", progressError)
      } else {
        setUserProgress(progressData)
      }

      // Fetch subject progress
      const { data: subjectData, error: subjectError } = await supabase
        .from("subject_progress")
        .select("*")
        .eq("user_id", user?.id)
        .order("progress_percentage", { ascending: false })

      if (subjectError) {
        console.error("Error fetching subject progress:", subjectError)
      } else {
        setSubjectProgress(subjectData || [])
      }

      // Generate weekly activity (last 7 days)
      const { data: quizData } = await supabase
        .from("quiz_attempts")
        .select("completed_at")
        .eq("user_id", user?.id)
        .gte("completed_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      const activity = generateWeeklyActivity(quizData || [])
      setWeeklyActivity(activity)
    } catch (error) {
      console.error("Error fetching progress data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateWeeklyActivity = (quizData: any[]) => {
    const today = new Date()
    const activity = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toDateString()

      const hasActivity = quizData.some((quiz) => {
        const quizDate = new Date(quiz.completed_at)
        return quizDate.toDateString() === dateString
      })

      activity.push(hasActivity)
    }

    return activity
  }

  const getXPForLevel = (level: number): number => {
    switch (level) {
      case 1:
        return 0
      case 2:
        return 100
      case 3:
        return 300
      case 4:
        return 600
      case 5:
        return 1000
      case 6:
        return 1500
      case 7:
        return 2100
      case 8:
        return 2800
      case 9:
        return 3600
      case 10:
        return 4500
      default:
        return 4500 + (level - 10) * 1000
    }
  }

  const getXPForNextLevel = (currentLevel: number): number => {
    return getXPForLevel(currentLevel + 1)
  }

  const getCurrentLevelProgress = (xp: number, level: number): number => {
    const currentLevelXP = getXPForLevel(level)
    const nextLevelXP = getXPForNextLevel(level)
    const progressXP = xp - currentLevelXP
    const totalXPNeeded = nextLevelXP - currentLevelXP
    return Math.min(100, (progressXP / totalXPNeeded) * 100)
  }

  const getStreakColor = (days: number): string => {
    if (days >= 30) return "from-purple-500 to-pink-500"
    if (days >= 14) return "from-orange-500 to-red-500"
    if (days >= 7) return "from-yellow-500 to-orange-500"
    if (days >= 3) return "from-green-500 to-emerald-500"
    return "from-blue-500 to-cyan-500"
  }

  const getStreakMessage = (days: number): string => {
    if (days >= 30) return "Legendary streak! 🔥"
    if (days >= 14) return "Amazing dedication! 🌟"
    if (days >= 7) return "Great consistency! 💪"
    if (days >= 3) return "Building momentum! 🚀"
    if (days >= 1) return "Keep it up! 📚"
    return "Start your streak today! ⭐"
  }

  const defaultSubjects = [
    { name: "Mathematics", icon: "📊", color: "from-blue-500 to-cyan-500" },
    { name: "Science", icon: "🔬", color: "from-green-500 to-emerald-500" },
    { name: "English", icon: "📚", color: "from-purple-500 to-pink-500" },
    { name: "History", icon: "🏛️", color: "from-orange-500 to-red-500" },
    { name: "Geography", icon: "🌍", color: "from-teal-500 to-blue-500" },
    { name: "General Knowledge", icon: "🧠", color: "from-indigo-500 to-purple-500" },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const currentLevel = userProgress?.level || 1
  const currentXP = userProgress?.xp_points || 0
  const streakDays = userProgress?.streak_days || 0
  const levelProgress = getCurrentLevelProgress(currentXP, currentLevel)
  const xpForNext = getXPForNextLevel(currentLevel)
  const xpNeeded = xpForNext - currentXP

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Level {currentLevel}</h3>
              <p className="text-purple-100">
                {xpNeeded > 0 ? `${xpNeeded} XP to Level ${currentLevel + 1}` : "Max level reached!"}
              </p>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center">
              <Trophy className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{getXPForLevel(currentLevel)} XP</span>
              <span>{currentXP} XP</span>
              <span>{xpForNext} XP</span>
            </div>
            <div className="bg-white/20 rounded-full p-1">
              <Progress value={levelProgress} className="h-3 bg-white/30" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Tracker */}
      <Card className={`border-0 shadow-xl bg-gradient-to-r ${getStreakColor(streakDays)} text-white`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Study Streak</h3>
              <p className="text-orange-100">{getStreakMessage(streakDays)}</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-2">
                <Flame className="w-10 h-10" />
              </div>
              <div className="text-3xl font-bold">{streakDays}</div>
              <div className="text-sm opacity-80">days</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Weekly Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-xs text-gray-500 mb-2">{day}</div>
                <div
                  className={`w-8 h-8 rounded-lg ${
                    weeklyActivity[index]
                      ? "bg-gradient-to-r from-green-400 to-green-500"
                      : "bg-gray-200 hover:bg-gray-300"
                  } transition-colors`}
                  title={weeklyActivity[index] ? "Active" : "No activity"}
                ></div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            {weeklyActivity.filter(Boolean).length} days active this week!{" "}
            {weeklyActivity.filter(Boolean).length >= 5 ? "🎉" : "Keep going! 💪"}
          </p>
        </CardContent>
      </Card>

      {/* Subject Progress */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-green-500" />
            <span>Subject Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {defaultSubjects.map((subject) => {
            const progress = subjectProgress.find((p) => p.subject_name === subject.name)
            const percentage = progress?.progress_percentage || 0
            const quizCount = progress?.quizzes_completed || 0

            return (
              <div key={subject.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{subject.icon}</span>
                    <div>
                      <span className="font-medium text-gray-800">{subject.name}</span>
                      <p className="text-xs text-gray-500">{quizCount} quizzes completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-700">{percentage}%</span>
                    <Badge
                      className={`ml-2 ${
                        percentage >= 80
                          ? "bg-green-100 text-green-700"
                          : percentage >= 60
                            ? "bg-yellow-100 text-yellow-700"
                            : percentage >= 40
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {percentage >= 80
                        ? "Excellent"
                        : percentage >= 60
                          ? "Good"
                          : percentage >= 40
                            ? "Fair"
                            : "Beginner"}
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={percentage} className="h-3" />
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${subject.color} rounded-full opacity-80`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}

          {subjectProgress.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Start Learning!</p>
              <p>Complete quizzes to track your progress across subjects.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 mx-auto mb-3" />
            <div className="text-2xl font-bold">{currentXP}</div>
            <div className="text-sm opacity-80">Total XP</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-3" />
            <div className="text-2xl font-bold">{userProgress?.total_quizzes_completed || 0}</div>
            <div className="text-sm opacity-80">Quizzes Completed</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-3" />
            <div className="text-2xl font-bold">{Math.floor((userProgress?.total_study_time_minutes || 0) / 60)}h</div>
            <div className="text-sm opacity-80">Study Time</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
