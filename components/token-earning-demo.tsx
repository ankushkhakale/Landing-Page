"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Coins, 
  BookOpen, 
  Trophy, 
  Zap, 
  Clock, 
  Target, 
  Star,
  TrendingUp,
  MessageSquare,
  FileText
} from "lucide-react"

interface EarningDemoProps {
  onEarnTokens: (message: string, tokens: number, type: "earned" | "bonus" | "streak" | "achievement") => void
}

export function TokenEarningDemo({ onEarnTokens }: EarningDemoProps) {
  const [demoProgress, setDemoProgress] = useState({
    dailyLogin: 0,
    quizStreak: 0,
    uploadCount: 0,
    chatSessions: 0
  })

  const earningActivities = [
    {
      id: "daily_login",
      title: "Daily Login",
      description: "Log in every day to earn consistent Brain Bits",
      baseReward: 10,
      icon: <Clock className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
      progress: demoProgress.dailyLogin,
      maxProgress: 7,
      action: () => {
        setDemoProgress(prev => ({ ...prev, dailyLogin: Math.min(prev.dailyLogin + 1, 7) }))
        if (demoProgress.dailyLogin < 7) {
          onEarnTokens("Daily login! +10 Brain Bits", 10, "bonus")
        }
      }
    },
    {
      id: "quiz_master",
      title: "Quiz Master",
      description: "Complete quizzes with high accuracy",
      baseReward: 50,
      icon: <Target className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
      progress: demoProgress.quizStreak,
      maxProgress: 5,
      action: () => {
        setDemoProgress(prev => ({ ...prev, quizStreak: Math.min(prev.quizStreak + 1, 5) }))
        if (demoProgress.quizStreak < 5) {
          onEarnTokens("Quiz completed! +50 Brain Bits", 50, "earned")
        }
      }
    },
    {
      id: "content_creator",
      title: "Content Creator",
      description: "Upload and process learning materials",
      baseReward: 25,
      icon: <FileText className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
      progress: demoProgress.uploadCount,
      maxProgress: 3,
      action: () => {
        setDemoProgress(prev => ({ ...prev, uploadCount: Math.min(prev.uploadCount + 1, 3) }))
        if (demoProgress.uploadCount < 3) {
          onEarnTokens("Content uploaded! +25 Brain Bits", 25, "earned")
        }
      }
    },
    {
      id: "ai_chat_expert",
      title: "AI Chat Expert",
      description: "Engage in meaningful AI conversations",
      baseReward: 15,
      icon: <MessageSquare className="w-5 h-5" />,
      color: "from-orange-500 to-red-500",
      progress: demoProgress.chatSessions,
      maxProgress: 10,
      action: () => {
        setDemoProgress(prev => ({ ...prev, chatSessions: Math.min(prev.chatSessions + 1, 10) }))
        if (demoProgress.chatSessions < 10) {
          onEarnTokens("AI chat session! +15 Brain Bits", 15, "earned")
        }
      }
    }
  ]

  const bonusOpportunities = [
    {
      title: "Perfect Score",
      description: "Get 100% on any quiz",
      reward: 100,
      icon: <Star className="w-5 h-5" />,
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "7-Day Streak",
      description: "Maintain a 7-day learning streak",
      reward: 200,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Achievement Unlocked",
      description: "Unlock any achievement",
      reward: 150,
      icon: <Trophy className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Speed Learner",
      description: "Complete 3 quizzes in under 30 minutes",
      reward: 75,
      icon: <Zap className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Earning Activities */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Coins className="w-6 h-6" />
            Earn Brain Bits
          </CardTitle>
          <p className="text-muted-foreground">Complete activities to earn tokens and unlock rewards</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {earningActivities.map((activity) => (
              <motion.div
                key={activity.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${activity.color} rounded-xl flex items-center justify-center text-white`}>
                        {activity.icon}
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        +{activity.baseReward}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{activity.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{activity.description}</p>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{activity.progress}/{activity.maxProgress}</span>
                      </div>
                      <Progress value={(activity.progress / activity.maxProgress) * 100} />
                    </div>
                    
                    <Button 
                      onClick={activity.action}
                      disabled={activity.progress >= activity.maxProgress}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      {activity.progress >= activity.maxProgress ? "Completed!" : "Earn Tokens"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bonus Opportunities */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Bonus Opportunities
          </CardTitle>
          <p className="text-muted-foreground">Special rewards for exceptional performance</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bonusOpportunities.map((bonus, index) => (
              <motion.div
                key={bonus.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${bonus.color} rounded-xl flex items-center justify-center text-white mx-auto mb-3`}>
                      {bonus.icon}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{bonus.title}</h3>
                    <p className="text-muted-foreground text-xs mb-2">{bonus.description}</p>
                    <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                      +{bonus.reward} Brain Bits
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Pro Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-700">Maximize Your Earnings</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Complete daily login streaks for bonus rewards</li>
                <li>• Aim for high accuracy in quizzes</li>
                <li>• Upload diverse content types</li>
                <li>• Engage regularly with AI chat</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-cyan-700">Smart Spending</h4>
              <ul className="text-sm text-cyan-600 space-y-1">
                <li>• Save tokens for premium AI skins</li>
                <li>• Invest in custom learning paths</li>
                <li>• Use feedback sessions strategically</li>
                <li>• Unlock bonus missions for more rewards</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 