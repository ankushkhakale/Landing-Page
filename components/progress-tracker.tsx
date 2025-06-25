"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Flame, Trophy, Target, BookOpen, TrendingUp, Calendar, Zap, RefreshCw, Quote } from "lucide-react"
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

async function fetchProgressQuote() {
  try {
    const res = await fetch("/api/generate-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "progress" })
    })
    const data = await res.json()
    return data.quote || "Keep going! Every step counts!";
  } catch {
    return "Keep going! Every step counts!";
  }
}

export function ProgressTracker() {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([])
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>([])
  const [monthlyActivity, setMonthlyActivity] = useState<boolean[]>([])
  const [activityView, setActivityView] = useState<'weekly' | 'monthly'>('weekly')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()
  const [quote, setQuote] = useState<string>("");
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProgressData()
    }
  }, [user])

  useEffect(() => {
    getNewQuote();
    // eslint-disable-next-line
  }, []);

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

      // Generate monthly activity (up to 35 days)
      const monthActivity = generateMonthlyActivity(quizData || [])
      setMonthlyActivity(monthActivity)
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

  const generateMonthlyActivity = (quizData: any[]) => {
    const today = new Date()
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const activity: boolean[] = []
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i)
      const dateString = date.toDateString()
      const hasActivity = quizData.some((quiz) => {
        const quizDate = new Date(quiz.completed_at)
        return quizDate.toDateString() === dateString
      })
      activity.push(hasActivity)
    }
    // Pad to 35 days for a 5-row grid
    while (activity.length < 35) activity.push(false)
    return activity
  }

  // Helper to calculate the longest and current streak in a boolean array
  function getStreakInfo(activityArr: boolean[]) {
    let maxStreak = 0, currentStreak = 0, tempStreak = 0, activeDays = 0
    for (let i = 0; i < activityArr.length; i++) {
      if (activityArr[i]) {
        tempStreak++
        activeDays++
        if (tempStreak > maxStreak) maxStreak = tempStreak
      } else {
        tempStreak = 0
      }
    }
    // Calculate current streak (ending at last day)
    currentStreak = 0
    for (let i = activityArr.length - 1; i >= 0; i--) {
      if (activityArr[i]) currentStreak++
      else break
    }
    return { maxStreak, currentStreak, activeDays }
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

  // Add a color map for solid progress bar colors
  const subjectBarColors: Record<string, string> = {
    Mathematics: 'bg-blue-400',
    Science: 'bg-green-400',
    English: 'bg-purple-400',
    History: 'bg-orange-400',
    Geography: 'bg-teal-400',
    'General Knowledge': 'bg-indigo-400',
  }

  const getNewQuote = async () => {
    setQuoteLoading(true);
    setQuote("");
    const newQuote = await fetchProgressQuote();
    setQuote(newQuote);
    setQuoteLoading(false);
  };

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Level Card */}
      <Card className="rounded-xl border border-purple-100 dark:border-purple-900 shadow bg-white/90 dark:bg-[#23223a]/80 col-span-1 flex flex-col justify-between">
        <CardContent className="p-4 flex flex-col gap-2 items-center justify-center text-center">
          <div className="flex flex-col items-center justify-center w-full gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 dark:from-purple-700 dark:to-blue-700 rounded-xl flex items-center justify-center mb-1">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-bold">Level {currentLevel}</h3>
            <p className="text-xs text-purple-500 dark:text-purple-200">
              {xpNeeded > 0 ? `${xpNeeded} XP to Level ${currentLevel + 1}` : "Max level reached!"}
            </p>
          </div>
          <div className="flex justify-center items-center gap-4 w-full text-xs mt-2">
            <span>{getXPForLevel(currentLevel)} XP</span>
            <span className="font-bold text-lg text-purple-700 dark:text-purple-200">{currentXP} XP</span>
            <span>{xpForNext} XP</span>
          </div>
          <div className="w-full flex justify-center mt-2">
            <Progress value={levelProgress} className="h-2 bg-purple-100 dark:bg-purple-900 w-full max-w-[180px]" />
          </div>
        </CardContent>
      </Card>

      {/* Streak Card */}
      <Card className="rounded-xl border border-orange-100 dark:border-orange-900 shadow bg-white/90 dark:bg-[#23223a]/80 col-span-1 flex flex-col justify-between">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center justify-center w-full gap-2">
            {streakDays > 0 ? (
              <>
                <div className="flex flex-col items-center justify-center">
                  <span className="flex items-center justify-center text-2xl font-bold text-orange-500">
                    <Flame className="w-5 h-5 mr-1" />
                    {streakDays}
                  </span>
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-200 mt-1">Current Streak</span>
                </div>
                <span className="text-xs text-orange-500 dark:text-orange-200 mt-2">{getStreakMessage(streakDays)}</span>
              </>
            ) : (
              <>
                <span className="flex items-center justify-center text-3xl font-bold text-orange-400 mb-1">
                  <Flame className="w-8 h-8 mr-2 animate-bounce" />
                </span>
                <span className="text-base font-bold text-orange-700 dark:text-orange-200">Start Your Streak!</span>
                <span className="text-xs text-orange-500 dark:text-orange-200 mt-2">Complete a quiz or study today to begin your streak! 🔥</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compact Activity Card */}
      <Card className="rounded-xl border border-blue-100 dark:border-blue-900 shadow bg-white/90 dark:bg-[#23223a]/80 col-span-2 flex flex-col justify-between min-h-[170px]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>{activityView === 'weekly' ? 'Weekly' : 'Monthly'} Activity</span>
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <button
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activityView === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setActivityView('weekly')}
            >
              Weekly
            </button>
            <button
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activityView === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setActivityView('monthly')}
            >
              Monthly
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2 pt-0">
          {activityView === 'weekly' ? (
            <div className="flex flex-col items-center gap-1 w-full">
              <div className="flex gap-1 justify-center">
                {weeklyActivity.map((active, idx) => (
                  <div
                    key={idx}
                    className={`w-5 h-5 rounded border transition-colors duration-150
                      ${active
                        ? 'bg-green-400 border-green-500'
                        : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'}
                    `}
                    title={active ? 'Active' : 'No activity'}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {streakDays}d streak
                </span>
                <span className="text-blue-500 dark:text-blue-300">
                  {weeklyActivity.filter(Boolean).length}/7 days active
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 w-full">
              <div className="grid grid-cols-7 grid-rows-5 gap-0.5">
                {monthlyActivity.map((active, idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded border transition-colors duration-150
                      ${active
                        ? 'bg-green-400 border-green-500'
                        : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'}
                    `}
                    title={active ? 'Active' : 'No activity'}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {getStreakInfo(monthlyActivity).currentStreak}d streak
                </span>
                <span className="text-blue-500 dark:text-blue-300">
                  {getStreakInfo(monthlyActivity).activeDays} days active
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Quote Card (Motivation) */}
      <Card className="rounded-xl border border-pink-200 dark:border-pink-900 shadow bg-gradient-to-br from-pink-50 to-yellow-50 dark:from-pink-950 dark:to-yellow-950 flex flex-col justify-between items-center p-3 col-span-1 min-h-[100px] relative overflow-hidden">
        <div className="absolute -top-2 -right-2 opacity-20 text-pink-300 dark:text-pink-800 text-5xl pointer-events-none select-none">
          <Quote className="w-10 h-10" />
        </div>
        <div className="flex items-center w-full justify-between mb-1">
          <span className="text-xs font-bold text-pink-500 uppercase tracking-wider">Motivation</span>
          <button
            onClick={getNewQuote}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-200 hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors"
            disabled={quoteLoading}
            title="Get a new quote"
          >
            <RefreshCw className={`w-4 h-4 ${quoteLoading ? 'animate-spin' : ''}`} />
            New
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center w-full">
          {quoteLoading ? (
            <span className="text-pink-400 animate-pulse text-xs">Loading...</span>
          ) : (
            <span className="text-xs font-semibold text-pink-700 dark:text-pink-200 text-center italic max-w-[100px]">“{quote}”</span>
          )}
        </div>
      </Card>

      {/* Study Stats Card */}
      <Card className="rounded-xl border border-blue-100 dark:border-blue-900 shadow bg-white/90 dark:bg-[#23223a]/80 col-span-1 flex flex-row items-center justify-between px-2 py-3 gap-2 min-h-[100px]">
        {/* Total XP */}
        <div className="flex flex-col items-center flex-1">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-1">
            <Zap className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-base font-bold text-blue-700 dark:text-blue-300 truncate">{currentXP}</div>
          <div className="text-xs text-blue-500 dark:text-blue-200">Total XP</div>
        </div>
        {/* Quizzes Completed */}
        <div className="flex flex-col items-center flex-1">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-1">
            <Trophy className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-base font-bold text-green-700 dark:text-green-300 truncate">{userProgress?.total_quizzes_completed || 0}</div>
          <div className="text-xs text-green-500 dark:text-green-200">Quizzes Completed</div>
        </div>
        {/* Study Time */}
        <div className="flex flex-col items-center flex-1">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-base font-bold text-purple-700 dark:text-purple-300 truncate">{Math.floor((userProgress?.total_study_time_minutes || 0) / 60)}h</div>
          <div className="text-xs text-purple-500 dark:text-purple-200">Study Time</div>
        </div>
      </Card>

      {/* Subject Progress Card */}
      <Card className="rounded-xl border border-green-100 dark:border-green-900 shadow bg-white/90 dark:bg-[#23223a]/80 col-span-2 flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-green-500" />
            <span>Subject Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {defaultSubjects.map((subject) => {
              const progress = subjectProgress.find((p) => p.subject_name === subject.name)
              const percentage = progress?.progress_percentage || 0
              const quizCount = progress?.quizzes_completed || 0
              const accent = subject.color.replace('from-', 'border-l-4 border-').replace(' to-', ' ')
              return (
                <div key={subject.name} className={`flex flex-col justify-between bg-white dark:bg-[#23223a] rounded-xl shadow border ${accent} p-4 min-h-[110px] transition-all`}> 
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{subject.icon}</span>
                    <span className="font-semibold text-base text-gray-800 dark:text-gray-100">{subject.name}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">{quizCount} quizzes</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-2 rounded-full transition-all duration-500 ${subjectBarColors[subject.name]}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              )
            })}
            {subjectProgress.length === 0 && (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Start Learning!</p>
                <p>Complete quizzes to track your progress across subjects.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

