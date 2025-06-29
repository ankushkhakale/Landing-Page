"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  CheckCircle,
  Trash2,
  Mail,
  Phone,
  Sparkles,
  Coins,
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
import { SidebarTabs } from "@/components/ui/SidebarTabs"
import { NLPTools } from "@/components/nlp-tools"
import { TokenSystem } from "@/components/token-system"
import { TokenBalanceWidget } from "@/components/token-balance-widget"
import { useTokenNotifications } from "@/components/token-notification"
import { TokenNotification } from "@/components/token-notification"
import { TokenEarningDemo } from "@/components/token-earning-demo"

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
  const [activeTab, setActiveTab] = useState<
    "overview" | "learn" | "practice" | "progress" | "achievements" | "leaderboard" | "chat" | "profile" | "more" | "help" | "faq" | "nlp-tools"
  >("overview")
  const [moreSubTab, setMoreSubTab] = useState<"help" | "faq">("help")
  const [difficulty, setDifficulty] = useState("medium")
  const [contentType, setContentType] = useState("quiz")
  const [levelUpNotification, setLevelUpNotification] = useState<{
    show: boolean
    oldLevel: number
    newLevel: number
  } | null>(null)
  const { notifications, addNotification, removeNotification } = useTokenNotifications()
  const supabase = createClient()

  const tabItems = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "learn", label: "Learn", icon: BookOpen },
    { key: "practice", label: "Practice", icon: PlayCircle },
    { key: "nlp-tools", label: "NLP Tools", icon: Sparkles },
    { key: "progress", label: "Progress", icon: TrendingUp },
    { key: "achievements", label: "Achievements", icon: Award },
    { key: "leaderboard", label: "Leaderboard", icon: Crown },
    { key: "chat", label: "Chat", icon: MessageCircle },
    { key: "profile", label: "Profile", icon: User },
    { key: "more", label: "More", icon: FileText },
  ]

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

      // Award Brain Bits based on activity type
      let brainBits = 0
      let notificationMessage = ""
      let notificationType: "earned" | "bonus" | "streak" | "achievement" = "earned"

      switch (activityType) {
        case "file_uploaded":
          brainBits = 25
          notificationMessage = "File uploaded successfully! +25 Brain Bits"
          break
        case "quiz_completed":
          brainBits = 50
          notificationMessage = "Quiz completed! +50 Brain Bits"
          break
        case "streak_milestone":
          brainBits = 100
          notificationMessage = "Streak milestone reached! +100 Brain Bits"
          notificationType = "streak"
          break
        case "achievement_unlocked":
          brainBits = 200
          notificationMessage = "Achievement unlocked! +200 Brain Bits"
          notificationType = "achievement"
          break
        case "daily_login":
          brainBits = 10
          notificationMessage = "Daily login bonus! +10 Brain Bits"
          notificationType = "bonus"
          break
        default:
          brainBits = Math.floor(points / 10) // Convert XP to Brain Bits
          notificationMessage = `Activity completed! +${brainBits} Brain Bits`
      }

      // Show token notification
      if (brainBits > 0) {
        addNotification(notificationMessage, brainBits, notificationType)
      }

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
      message: `Great job! You scored ${score}/${totalQuestions}`,
      type: "success",
    })

    // Refresh user data to get updated progress
    await fetchUserData()
    // Do NOT close the quiz or reset selectedQuiz here. Let the user close it from the review/results UI.
    // setSelectedQuiz(null)
    // setActiveTab("overview")

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

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await supabase.from("quizzes").delete().eq("id", quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (error) {
      alert("Failed to delete quiz. Please try again.");
    }
  };

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
          <QuizPlayerEnhanced quiz={selectedQuiz} onComplete={handleQuizComplete} onClose={() => { setSelectedQuiz(null); setActiveTab("overview"); }} />
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
    <div className="flex flex-col min-h-screen">
      {/* Navbar at the top */}
      <header className="bg-white/40 dark:bg-[#181c2f]/70 backdrop-blur-lg border-b border-white/40 dark:border-[#23284a] sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between w-full">
            {/* Left: Logo and Brand */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight truncate">
                  BrainBuddy
                </span>
                <span className="text-sm text-muted-foreground truncate">Learning Dashboard</span>
              </div>
            </div>


            {/* Right: Badges, Theme, Notifications, User */}
            <div className="flex items-center gap-3">
              {/* Streak Badge */}
              <div className="flex items-center bg-orange-50 rounded-full px-3 py-1 shadow text-orange-700 font-semibold text-sm gap-1 border border-orange-100">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-bold">{streakDays}</span>
                <span className="text-xs">day streak</span>

              </div>
              {/* Level Badge */}
              <div className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-4 py-1 shadow text-white font-bold text-sm gap-1">
                <Crown className="w-5 h-5" />
                Level {currentLevel}
              </div>
              {/* Theme Toggle */}
              <div className="flex items-center">
                <ThemeToggle />
              </div>
              {/* Notifications */}
              <div className="flex items-center">
                <NotificationSystem />
              </div>
              {/* User Info */}
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9 border-2 border-purple-200">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                    {user?.user_metadata?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block min-w-0 text-right">
                  <p className="font-semibold text-foreground truncate text-base leading-tight">{user?.user_metadata?.full_name || "Learner"}</p>
                  <p className="text-sm text-muted-foreground truncate">{currentXP} XP</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="ml-1 p-1">
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Main dashboard content below navbar */}
      <div className="flex flex-1 min-h-0">
        <SidebarTabs
          items={tabItems}
          activeTab={activeTab}
          onTabChange={(key: string) => {
            if (key === "help" || key === "faq") {
              setActiveTab("more");
              setMoreSubTab(key as "help" | "faq");
            } else {
              setActiveTab(key as typeof activeTab);
            }
          }}
        />
        <div className="flex-1 bg-background min-h-0 overflow-auto">
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

          <div className="container mx-auto px-4 pt-4 pb-8">
            {/* Main Dashboard Tabs */}
            <div className="space-y-6">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
        {/* Welcome Section */}
        <div className="mb-6 pt-6 pb-6">
          <div className="text-left space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "Learner"}! 🎉
              </h1>
              <p className="text-lg text-muted-foreground">Ready to continue your learning adventure?</p>
            </div>
            {/* XP Progress Bar */}
            <div className="bg-muted rounded-full p-1 max-w-md">
              <div className="bg-background rounded-full px-4 py-2 flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">Level {currentLevel}</span>
                <div className="flex-1 mx-4">
                  <Progress value={levelProgress} className="h-2 bg-muted" />
                </div>
                <span className="text-foreground font-medium text-xs">
                  {xpNeeded > 0 ? `${xpNeeded} XP to Level ${currentLevel + 1}` : "Max Level!"}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
                onClick={() => setActiveTab("learn")}
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Continue Learning
              </Button>
              <Button
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-300 dark:text-purple-400 dark:hover:bg-purple-950"
                onClick={() => setActiveTab("achievements")}
              >
                <Trophy className="w-5 h-5 mr-2" />
                View Achievements
              </Button>
            </div>
          </div>
        </div>


        {/* Custom Tab Buttons */}
        <div className="mb-6">
          <div className="flex justify-between">
            <button
              className={`px-6 py-3 rounded-full text-purple-700 dark:text-purple-400 border-2 border-purple-500 dark:border-purple-400 bg-transparent font-semibold transition-all duration-100 relative overflow-hidden hover:scale-110 active:scale-100 hover:text-gray-900 dark:hover:text-white hover:shadow-[0_0px_20px_rgba(124,58,237,0.4)] ${
                activeTab === "overview" 
                  ? "text-gray-900 dark:text-white bg-purple-500 dark:bg-purple-500 shadow-[0_0px_20px_rgba(124,58,237,0.4)]" 
                  : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <div className="absolute inset-0 bg-purple-500 dark:bg-purple-500 rounded-full scale-0 transition-all duration-600 ease-[cubic-bezier(0.23,1,0.320,1)] hover:scale-[3] -z-10"></div>
              <span className="relative z-10">
                <BarChart3 className="w-4 h-4 mr-2 inline" />
                Overview
              </span>
            </button>
            
            <button
              className={`px-6 py-3 rounded-full text-purple-700 dark:text-purple-400 border-2 border-purple-500 dark:border-purple-400 bg-transparent font-semibold transition-all duration-100 relative overflow-hidden hover:scale-110 active:scale-100 hover:text-gray-900 dark:hover:text-white hover:shadow-[0_0px_20px_rgba(124,58,237,0.4)] ${
                activeTab === "learn" 
                  ? "text-gray-900 dark:text-white bg-purple-500 dark:bg-purple-500 shadow-[0_0px_20px_rgba(124,58,237,0.4)]" 
                  : ""
              }`}
              onClick={() => setActiveTab("learn")}
            >
              <div className="absolute inset-0 bg-purple-500 dark:bg-purple-500 rounded-full scale-0 transition-all duration-600 ease-[cubic-bezier(0.23,1,0.320,1)] hover:scale-[3] -z-10"></div>
              <span className="relative z-10">
                <BookOpen className="w-4 h-4 mr-2 inline" />
                Learn
              </span>
            </button>
            
            <button
              className={`px-6 py-3 rounded-full text-purple-700 dark:text-purple-400 border-2 border-purple-500 dark:border-purple-400 bg-transparent font-semibold transition-all duration-100 relative overflow-hidden hover:scale-110 active:scale-100 hover:text-gray-900 dark:hover:text-white hover:shadow-[0_0px_20px_rgba(124,58,237,0.4)] ${
                activeTab === "progress" 
                  ? "text-gray-900 dark:text-white bg-purple-500 dark:bg-purple-500 shadow-[0_0px_20px_rgba(124,58,237,0.4)]" 
                  : ""
              }`}
              onClick={() => setActiveTab("progress")}
            >
              <div className="absolute inset-0 bg-purple-500 dark:bg-purple-500 rounded-full scale-0 transition-all duration-600 ease-[cubic-bezier(0.23,1,0.320,1)] hover:scale-[3] -z-10"></div>
              <span className="relative z-10">
                <TrendingUp className="w-4 h-4 mr-2 inline" />
                Progress
              </span>
            </button>
            
            <button
              className={`px-6 py-3 rounded-full text-purple-700 dark:text-purple-400 border-2 border-purple-500 dark:border-purple-400 bg-transparent font-semibold transition-all duration-100 relative overflow-hidden hover:scale-110 active:scale-100 hover:text-gray-900 dark:hover:text-white hover:shadow-[0_0px_20px_rgba(124,58,237,0.4)] ${
                activeTab === "achievements" 
                  ? "text-gray-900 dark:text-white bg-purple-500 dark:bg-purple-500 shadow-[0_0px_20px_rgba(124,58,237,0.4)]" 
                  : ""
              }`}
              onClick={() => setActiveTab("achievements")}
            >
              <div className="absolute inset-0 bg-purple-500 dark:bg-purple-500 rounded-full scale-0 transition-all duration-600 ease-[cubic-bezier(0.23,1,0.320,1)] hover:scale-[3] -z-10"></div>
              <span className="relative z-10">
                <Award className="w-4 h-4 mr-2 inline" />
                Achievements
              </span>
            </button>
            
            <button
              className={`px-6 py-3 rounded-full text-purple-700 dark:text-purple-400 border-2 border-purple-500 dark:border-purple-400 bg-transparent font-semibold transition-all duration-100 relative overflow-hidden hover:scale-110 active:scale-100 hover:text-gray-900 dark:hover:text-white hover:shadow-[0_0px_20px_rgba(124,58,237,0.4)] ${
                activeTab === "leaderboard" 
                  ? "text-gray-900 dark:text-white bg-purple-500 dark:bg-purple-500 shadow-[0_0px_20px_rgba(124,58,237,0.4)]" 
                  : ""
              }`}
              onClick={() => setActiveTab("leaderboard")}
            >
              <div className="absolute inset-0 bg-purple-500 dark:bg-purple-500 rounded-full scale-0 transition-all duration-600 ease-[cubic-bezier(0.23,1,0.320,1)] hover:scale-[3] -z-10"></div>
              <span className="relative z-10">
                <Crown className="w-4 h-4 mr-2 inline" />
                Leaderboard
              </span>
            </button>
            
            <button
              className={`px-6 py-3 rounded-full text-purple-700 dark:text-purple-400 border-2 border-purple-500 dark:border-purple-400 bg-transparent font-semibold transition-all duration-100 relative overflow-hidden hover:scale-110 active:scale-100 hover:text-gray-900 dark:hover:text-white hover:shadow-[0_0px_20px_rgba(124,58,237,0.4)] ${
                activeTab === "chat" 
                  ? "text-gray-900 dark:text-white bg-purple-500 dark:bg-purple-500 shadow-[0_0px_20px_rgba(124,58,237,0.4)]" 
                  : ""
              }`}
              onClick={() => setActiveTab("chat")}
            >
              <div className="absolute inset-0 bg-purple-500 dark:bg-purple-500 rounded-full scale-0 transition-all duration-600 ease-[cubic-bezier(0.23,1,0.320,1)] hover:scale-[3] -z-10"></div>
              <span className="relative z-10">
                <MessageCircle className="w-4 h-4 mr-2 inline" />
                Chat
              </span>
            </button>
            
            <button
              className={`px-6 py-3 rounded-full text-purple-700 dark:text-purple-400 border-2 border-purple-500 dark:border-purple-400 bg-transparent font-semibold transition-all duration-100 relative overflow-hidden hover:scale-110 active:scale-100 hover:text-gray-900 dark:hover:text-white hover:shadow-[0_0px_20px_rgba(124,58,237,0.4)] ${
                activeTab === "tokens" 
                  ? "text-gray-900 dark:text-white bg-purple-500 dark:bg-purple-500 shadow-[0_0px_20px_rgba(124,58,237,0.4)]" 
                  : ""
              }`}
              onClick={() => setActiveTab("tokens")}
            >
              <div className="absolute inset-0 bg-purple-500 dark:bg-purple-500 rounded-full scale-0 transition-all duration-600 ease-[cubic-bezier(0.23,1,0.320,1)] hover:scale-[3] -z-10"></div>
              <span className="relative z-10">
                <Coins className="w-4 h-4 mr-2 inline" />
                Tokens
              </span>
            </button>
            
            <button
              className={`px-6 py-3 rounded-full text-purple-700 dark:text-purple-400 border-2 border-purple-500 dark:border-purple-400 bg-transparent font-semibold transition-all duration-100 relative overflow-hidden hover:scale-110 active:scale-100 hover:text-gray-900 dark:hover:text-white hover:shadow-[0_0px_20px_rgba(124,58,237,0.4)] ${
                activeTab === "profile" 
                  ? "text-gray-900 dark:text-white bg-purple-500 dark:bg-purple-500 shadow-[0_0px_20px_rgba(124,58,237,0.4)]" 
                  : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <div className="absolute inset-0 bg-purple-500 dark:bg-purple-500 rounded-full scale-0 transition-all duration-600 ease-[cubic-bezier(0.23,1,0.320,1)] hover:scale-[3] -z-10"></div>
              <span className="relative z-10">
                <User className="w-4 h-4 mr-2 inline" />
                Profile
              </span>
            </button>
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total XP Card */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        Level {currentLevel}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Total XP</p>
                      <p className="text-3xl font-bold text-foreground">{currentXP}</p>
                      <p className="text-xs text-muted-foreground">
                        {xpNeeded > 0 ? `${xpNeeded} XP to next level` : "Max level reached!"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Streak Days Card */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                        <Flame className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                        Active
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Streak Days</p>
                      <p className="text-3xl font-bold text-foreground">{streakDays}</p>
                      <p className="text-xs text-muted-foreground">
                        {streakDays >= 7 ? "Amazing streak! 🔥" : streakDays > 0 ? "Keep it up! 💪" : "Start your streak today!"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quizzes Completed Card */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        Completed
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Quizzes Completed</p>
                      <p className="text-3xl font-bold text-foreground">{userProgress?.total_quizzes_completed || 0}</p>
                      <p className="text-xs text-muted-foreground">Great progress!</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Study Time Card */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        Today
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Study Time</p>
                      <p className="text-3xl font-bold text-foreground">{Math.floor((userProgress?.total_study_time_minutes || 0) / 60)}h</p>
                      <p className="text-xs text-muted-foreground">{(userProgress?.total_study_time_minutes || 0) % 60}m this session</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Learn Tab */}
          {activeTab === "learn" && (
            <div className="space-y-6">
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
            </div>
          )}

          {/* Practice Tab */}
          {activeTab === "practice" && (
            <div className="space-y-8">
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
                            <div className="flex items-center justify-between mb-2 gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <h4 className="font-semibold text-foreground truncate flex-1">{quiz.title}</h4>
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
                              <button
                                className="ml-2 p-1 rounded-full hover:bg-red-100 text-red-500 hover:text-red-700 transition flex-shrink-0"
                                title="Delete Quiz"
                                onClick={e => { e.stopPropagation(); handleDeleteQuiz(quiz.id); }}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
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
              <div className="mt-8 text-center">
                <h3 className="text-xl font-semibold mb-2 text-foreground">Daily Challenge</h3>
                <p className="text-muted-foreground mb-4">Complete today's challenge to earn bonus XP and unlock a surprise!</p>
                <Button className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-bold px-8 py-3 text-lg rounded-full hover:scale-105 transition-transform">
                  Take the Daily Challenge
                </Button>
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === "progress" && (
            <div className="space-y-6">
              <ProgressTracker />
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <div className="space-y-6">
              <AchievementSystem />
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <div className="space-y-6">
                  <Leaderboard limit={15} showCurrentUser={true} variant="full" />
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="space-y-6">
              <AIChat />
            </div>
          )}

          {/* Tokens Tab */}
          {activeTab === "tokens" && (
            <div className="space-y-6">
              <TokenSystem />
              <TokenEarningDemo onEarnTokens={addNotification} />
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <EditableProfile onProfileUpdate={fetchUserData} />
            </div>
          )}

          {/* More Tab */}
          {activeTab === "more" && (
            <div className="space-y-6">
              <div className="flex gap-4 mb-6">
                <button
                  className={`px-6 py-2 rounded-lg font-semibold text-base transition-colors duration-150 ${moreSubTab === "help" ? "bg-purple-100 text-purple-700 shadow" : "bg-transparent text-gray-700 hover:bg-purple-50"}`}
                  onClick={() => setMoreSubTab("help")}
                >
                  Help and Support
                </button>
                <button
                  className={`px-6 py-2 rounded-lg font-semibold text-base transition-colors duration-150 ${moreSubTab === "faq" ? "bg-purple-100 text-purple-700 shadow" : "bg-transparent text-gray-700 hover:bg-purple-50"}`}
                  onClick={() => setMoreSubTab("faq")}
                >
                  FAQ
                </button>
              </div>
              {moreSubTab === "help" && (
                <div className="p-8 rounded-xl shadow text-center space-y-6 bg-white dark:bg-[#181c2f] border border-border dark:border-[#23284a]">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Help and Support</h2>
                  <p className="text-muted-foreground mb-6 text-gray-600 dark:text-gray-400">We're here to help! If you have any questions, issues, or need assistance with BrainBuddy, please reach out to our support team. You can also check our FAQ for quick answers.</p>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-lg text-foreground">Support & Contact:</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <a href="tel:+917276412788" className="text-blue-700 dark:text-blue-400 hover:underline text-base">+91 72764 12788</a>
                      <a href="tel:+917588195521" className="text-blue-700 dark:text-blue-400 hover:underline text-base">+91 75881 95521</a>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <a href="mailto:neongenesis.devs@gmail.com" className="text-purple-700 dark:text-purple-300 hover:underline text-base font-medium">neongenesis.devs@gmail.com</a>
                    </div>
                  </div>
                </div>
              )}
              {moreSubTab === "faq" && (
                <div className="p-8 rounded-xl shadow text-left max-w-2xl mx-auto bg-white dark:bg-[#181c2f] border border-border dark:border-[#23284a]">
                  <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-purple-700 dark:text-purple-300">What is BrainBuddy?</h3>
                      <p className="text-muted-foreground text-gray-600 dark:text-gray-400">BrainBuddy is an AI-powered learning companion designed to make studying fun, interactive, and personalized for students under 15. It helps you learn through quizzes, flashcards, and gamified progress tracking.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-purple-700 dark:text-purple-300">Is BrainBuddy safe for kids?</h3>
                      <p className="text-muted-foreground text-gray-600 dark:text-gray-400">Absolutely! BrainBuddy is built with safety and privacy in mind. All content is age-appropriate, and your data is protected with industry-standard security measures.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-purple-700 dark:text-purple-300">How do I generate quizzes or study materials?</h3>
                      <p className="text-muted-foreground text-gray-600 dark:text-gray-400">Simply upload your notes, PDFs, images, or videos in the Learn section. BrainBuddy will automatically create personalized quizzes, summaries, and flashcards for you to practice.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-purple-700 dark:text-purple-300">Can I track my progress?</h3>
                      <p className="text-muted-foreground text-gray-600 dark:text-gray-400">Yes! The dashboard shows your XP, level, streaks, and completed quizzes. You can see your growth and celebrate achievements as you learn.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-purple-700 dark:text-purple-300">How do I get help or support?</h3>
                      <p className="text-muted-foreground text-gray-600 dark:text-gray-400">If you need assistance, visit the Help and Support section under More, or contact us at <a href="mailto:neongenesis.devs@gmail.com" className="text-purple-700 dark:text-purple-300 hover:underline">neongenesis.devs@gmail.com</a> or call our support numbers.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NLP Tools Tab */}
          {activeTab === "nlp-tools" && (
            <div className="space-y-6">
              <NLPTools />
            </div>
          )}
            </div>
          </div>
        </div>
      </div>

      {/* Token Notifications */}
      {notifications.map((notification) => (
        <TokenNotification
          key={notification.id}
          message={notification.message}
          tokens={notification.tokens}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}
