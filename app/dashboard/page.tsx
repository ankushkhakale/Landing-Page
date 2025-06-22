"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Brain,
  Trophy,
  BookOpen,
  Zap,
  LogOut,
  User,
  MessageCircle,
  TrendingUp,
  Clock,
  Award,
  FileText,
  BarChart3,
  Flame,
  Crown,
  PlayCircle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase-client"
import { FileUpload } from "@/components/file-upload"
import { AIChat } from "@/components/ai-chat"
import { QuizPlayerEnhanced } from "@/components/quiz-player-enhanced"
import { AchievementSystem } from "@/components/achievement-system"
import { ProgressTracker } from "@/components/progress-tracker"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationSystem } from "@/components/notification-system"
import { Leaderboard } from "@/components/leaderboard"
import { EditableProfile } from "@/components/editable-profile"

interface UserProgress {
  xp_points: number
  level: number
  streak_days: number
  total_quizzes_completed: number
  total_study_time_minutes: number
  last_activity_date: string
}

interface Quiz {
  id: string
  title: string
  questions: any[]
  difficulty_level: string
  total_questions: number
  created_at: string
}

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [difficulty, setDifficulty] = useState("medium")
  const [contentType, setContentType] = useState("quiz")
  const [levelUpNotification, setLevelUpNotification] = useState<{
    show: boolean
    oldLevel: number
    newLevel: number
  } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchUserData()
    initializeUserInLeaderboard()
  }, [user, router])

  const initializeUserInLeaderboard = async () => {
    if (!user) return

    try {
      // Check if user exists in leaderboard
      const { data: existingUser } = await supabase.from("leaderboards").select("id").eq("user_id", user.id).single()

      if (!existingUser) {
        // Create leaderboard entry for new user
        await supabase.from("leaderboards").insert({
          user_id: user.id,
          username: user.user_metadata?.username || user.user_metadata?.full_name || "Anonymous",
          avatar_url: user.user_metadata?.avatar_url,
          total_xp: 0,
          current_level: 1,
          streak_days: 0,
          quizzes_completed: 0,
        })
      }
    } catch (error) {
      console.error("Error initializing leaderboard:", error)
    }
  }

  const fetchUserData = async () => {
    try {
      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user?.id)
        .single()

      if (progressError && progressError.code !== "PGRST116") {
        console.error("Error fetching user progress:", progressError)
        // Create initial progress record if it doesn't exist
        if (progressError.code === "PGRST116") {
          const { data: newProgress } = await supabase
            .from("user_progress")
            .insert({
              user_id: user?.id,
              xp_points: 0,
              level: 1,
              streak_days: 0,
            })
            .select()
            .single()
          setUserProgress(newProgress)
        }
      } else {
        setUserProgress(progressData)
      }

      // Fetch user quizzes
      const { data: quizzesData, error: quizzesError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (quizzesError) {
        console.error("Error fetching quizzes:", quizzesError)
      } else {
        setQuizzes(quizzesData || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleFileProcessed = async (fileData: any) => {
    if (fileData.result && contentType === "quiz") {
      // Record activity
      await recordActivity("file_uploaded", 10)

      // Refresh quizzes
      fetchUserData()

      // Create notification
      await supabase.from("notifications").insert({
        user_id: user?.id,
        title: "File Processed Successfully!",
        message: "Your content has been processed and a new quiz is ready.",
        type: "success",
      })
    }
  }

  const recordActivity = async (activityType: string, points = 0) => {
    if (!user) return

    try {
      // Record the activity
      await supabase.from("user_activities").insert({
        user_id: user.id,
        activity_type: activityType,
        points_earned: points,
      })

      // Update streak
      const { data: newStreak } = await supabase.rpc("check_and_update_streak", { p_user_id: user.id })

      // Update user progress
      const { data: updatedProgress } = await supabase.from("user_progress").select("*").eq("user_id", user.id).single()

      if (updatedProgress) {
        setUserProgress(updatedProgress)

        // Update leaderboard
        await supabase.from("leaderboards").upsert({
          user_id: user.id,
          username: user.user_metadata?.username || user.user_metadata?.full_name || "Anonymous",
          avatar_url: user.user_metadata?.avatar_url,
          total_xp: updatedProgress.xp_points,
          current_level: updatedProgress.level,
          streak_days: updatedProgress.streak_days,
          quizzes_completed: updatedProgress.total_quizzes_completed,
        })
      }

      // Check for streak milestone notifications
      if (newStreak && newStreak > 0) {
        const streakMilestones = [1, 3, 7, 14, 30, 50, 100]
        if (streakMilestones.includes(newStreak)) {
          await supabase.from("notifications").insert({
            user_id: user.id,
            title: `${newStreak} Day Streak! 🔥`,
            message: `Amazing! You've maintained your learning streak for ${newStreak} days!`,
            type: "achievement",
          })
        }
      }
    } catch (error) {
      console.error("Error recording activity:", error)
    }
  }

  const handleQuizComplete = async (score: number, totalQuestions: number, timeSpent: number) => {
    const xpEarned = Math.floor((score / totalQuestions) * 50) // Base XP calculation

    // Record quiz completion activity
    await recordActivity("quiz_completed", xpEarned)

    // Create completion notification
    await supabase.from("notifications").insert({
      user_id: user?.id,
      title: "Quiz Completed! 🎉",
      message: `Great job! You scored ${score}/${totalQuestions} and earned ${xpEarned} XP!`,
      type: "success",
    })

    // Refresh user data to get updated progress
    await fetchUserData()
    setSelectedQuiz(null)
    setActiveTab("overview")
  }

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="loader">
            <span>Loading...</span>
          </div>
          <p className="text-purple-600 font-medium">Loading your learning adventure...</p>
        </div>
      </div>
    )
  }

  if (selectedQuiz) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Button variant="outline" onClick={() => setSelectedQuiz(null)} className="mb-4">
              ← Back to Dashboard
            </Button>
          </div>
          <QuizPlayerEnhanced quiz={selectedQuiz} onComplete={handleQuizComplete} />
        </div>
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
    <div className="min-h-screen bg-background">
      {/* Level Up Notification */}
      {levelUpNotification?.show && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-xl font-bold">Level Up!</h3>
              <p>
                Level {levelUpNotification.oldLevel} → {levelUpNotification.newLevel}
              </p>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 mt-2"
                onClick={() => setLevelUpNotification(null)}
              >
                Awesome! 🎉
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <header className="bg-background/90 backdrop-blur-lg border-b border-purple-100 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  BrainBuddy
                </h1>
                <p className="text-sm text-muted-foreground">Learning Dashboard</p>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              {/* Streak Counter */}
              <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2 rounded-full">
                <Flame className={`w-5 h-5 ${streakDays > 0 ? "text-orange-500" : "text-gray-400"}`} />
                <span className={`font-bold ${streakDays > 0 ? "text-orange-700" : "text-gray-500"}`}>
                  {streakDays}
                </span>
                <span className={`text-sm ${streakDays > 0 ? "text-orange-600" : "text-gray-500"}`}>day streak</span>
              </div>

              {/* Level Badge */}
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-bold">
                <Crown className="w-4 h-4 mr-1" />
                Level {currentLevel}
              </Badge>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <NotificationSystem />

              {/* Profile Menu */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10 border-2 border-purple-200">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                    {user?.user_metadata?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="font-semibold text-foreground">{user?.user_metadata?.full_name || "Learner"}</p>
                  <p className="text-sm text-muted-foreground">{currentXP} XP</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "Learner"}! 🎉
              </h1>
              <p className="text-xl text-purple-100 mb-6">Ready to continue your learning adventure?</p>

              {/* XP Progress Bar */}
              <div className="bg-white/20 rounded-full p-1 mb-4">
                <div className="bg-white rounded-full px-4 py-2 flex items-center justify-between">
                  <span className="text-purple-600 font-bold">Level {currentLevel}</span>
                  <div className="flex-1 mx-4">
                    <Progress value={levelProgress} className="h-3 bg-purple-100" />
                  </div>
                  <span className="text-purple-600 font-bold">
                    {xpNeeded > 0 ? `${xpNeeded} XP to Level ${currentLevel + 1}` : "Max Level!"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  className="bg-white text-purple-600 hover:bg-purple-50 font-bold"
                  onClick={() => setActiveTab("learn")}
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Continue Learning
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-purple-600"
                  onClick={() => setActiveTab("achievements")}
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  View Achievements
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-lg">
            <TabsTrigger value="overview" className="rounded-xl font-medium">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="learn" className="rounded-xl font-medium">
              <BookOpen className="w-4 h-4 mr-2" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="progress" className="rounded-xl font-medium">
              <TrendingUp className="w-4 h-4 mr-2" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-xl font-medium">
              <Award className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="rounded-xl font-medium">
              <Crown className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="chat" className="rounded-xl font-medium">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-xl font-medium">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total XP</p>
                      <p className="text-3xl font-bold">{currentXP}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Zap className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={levelProgress} className="h-2 bg-purple-400" />
                    <p className="text-xs text-purple-100 mt-1">
                      {xpNeeded > 0 ? `${xpNeeded} XP to next level` : "Max level reached!"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Streak Days</p>
                      <p className="text-3xl font-bold">{streakDays}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Flame className={`w-6 h-6 ${streakDays > 0 ? "" : "opacity-50"}`} />
                    </div>
                  </div>
                  <p className="text-xs text-orange-100 mt-4">
                    {streakDays >= 7
                      ? "Amazing streak! 🔥"
                      : streakDays > 0
                        ? "Keep it up! 💪"
                        : "Start your streak today!"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Quizzes Completed</p>
                      <p className="text-3xl font-bold">{userProgress?.total_quizzes_completed || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Trophy className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-xs text-green-100 mt-4">Great progress!</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Study Time</p>
                      <p className="text-3xl font-bold">
                        {Math.floor((userProgress?.total_study_time_minutes || 0) / 60)}h
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-xs text-blue-100 mt-4">
                    {(userProgress?.total_study_time_minutes || 0) % 60}m this session
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Quizzes */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Your Quizzes
                </CardTitle>
                <CardDescription>Practice with your generated quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                {quizzes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quizzes.map((quiz) => (
                      <Card
                        key={quiz.id}
                        className="border-purple-200 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => startQuiz(quiz)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-foreground truncate">{quiz.title}</h4>
                            <Badge
                              className={`text-xs ${
                                quiz.difficulty_level === "easy"
                                  ? "bg-green-100 text-green-700"
                                  : quiz.difficulty_level === "medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {quiz.difficulty_level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{quiz.total_questions} questions</p>
                          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm">
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Start Quiz
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-lg font-medium mb-2">No quizzes yet</p>
                    <p>Upload some content to generate your first quiz!</p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      onClick={() => setActiveTab("learn")}
                    >
                      Upload Content
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learn Tab */}
          <TabsContent value="learn" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upload Section */}
              <Card className="lg:col-span-2 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Upload Learning Materials
                  </CardTitle>
                  <CardDescription>
                    Upload PDFs, notes, images, or videos to generate personalized learning content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload onFileProcessed={handleFileProcessed} difficulty={difficulty} contentType={contentType} />
                </CardContent>
              </Card>

              {/* Quick Options */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Quick Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Difficulty Level</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Content Type</label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quiz">Quiz (15+ Questions)</SelectItem>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="flowchart">Flowchart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <ProgressTracker />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <AchievementSystem />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Leaderboard limit={20} showCurrentUser={true} variant="full" />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <AIChat />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <EditableProfile onProfileUpdate={fetchUserData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
