"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Coins, 
  Sparkles, 
  Trophy, 
  Target, 
  BookOpen, 
  Zap, 
  Gift, 
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  Lock,
  Unlock,
  ShoppingCart,
  Brain,
  Lightbulb,
  MessageSquare,
  Route
} from "lucide-react"
import GradientText from "@/components/ui/GradientText"

interface TokenBalance {
  brainBits: number
  level: number
  totalEarned: number
  nextLevelProgress: number
}

interface EarningOpportunity {
  id: string
  title: string
  description: string
  tokens: number
  type: "daily" | "achievement" | "streak" | "challenge"
  completed: boolean
  progress?: number
  maxProgress?: number
  icon: React.ReactNode
  color: string
}

interface MarketplaceItem {
  id: string
  name: string
  description: string
  cost: number
  type: "ai_skin" | "feedback" | "mission" | "learning_path"
  rarity: "common" | "rare" | "epic" | "legendary"
  icon: React.ReactNode
  color: string
  unlocked: boolean
  preview?: string
}

export function TokenSystem() {
  const [tokenBalance, setTokenBalance] = useState<TokenBalance>({
    brainBits: 1250,
    level: 8,
    totalEarned: 3200,
    nextLevelProgress: 75
  })

  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null)
  const [activeTab, setActiveTab] = useState("earn")

  const earningOpportunities: EarningOpportunity[] = [
    {
      id: "daily_login",
      title: "Daily Login",
      description: "Log in for 7 consecutive days",
      tokens: 50,
      type: "daily",
      completed: false,
      progress: 5,
      maxProgress: 7,
      icon: <Clock className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "quiz_master",
      title: "Quiz Master",
      description: "Complete 10 quizzes with 80%+ accuracy",
      tokens: 200,
      type: "achievement",
      completed: false,
      progress: 7,
      maxProgress: 10,
      icon: <Trophy className="w-5 h-5" />,
      color: "from-yellow-500 to-orange-500"
    },
    {
      id: "streak_champion",
      title: "Streak Champion",
      description: "Maintain a 14-day study streak",
      tokens: 300,
      type: "streak",
      completed: false,
      progress: 12,
      maxProgress: 14,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "ai_chat_expert",
      title: "AI Chat Expert",
      description: "Have 20 meaningful conversations with AI",
      tokens: 150,
      type: "achievement",
      completed: false,
      progress: 15,
      maxProgress: 20,
      icon: <MessageSquare className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "content_creator",
      title: "Content Creator",
      description: "Upload and process 5 different types of content",
      tokens: 250,
      type: "achievement",
      completed: false,
      progress: 3,
      maxProgress: 5,
      icon: <BookOpen className="w-5 h-5" />,
      color: "from-indigo-500 to-blue-500"
    },
    {
      id: "speed_learner",
      title: "Speed Learner",
      description: "Complete 3 quizzes in under 10 minutes each",
      tokens: 100,
      type: "challenge",
      completed: false,
      icon: <Zap className="w-5 h-5" />,
      color: "from-red-500 to-pink-500"
    }
  ]

  const marketplaceItems: MarketplaceItem[] = [
    // AI Skins
    {
      id: "neural_avatar",
      name: "Neural Network Avatar",
      description: "Transform your AI assistant into a futuristic neural network visualization",
      cost: 500,
      type: "ai_skin",
      rarity: "epic",
      icon: <Brain className="w-6 h-6" />,
      color: "from-purple-600 to-blue-600",
      unlocked: false,
      preview: "🧠"
    },
    {
      id: "cosmic_ai",
      name: "Cosmic AI",
      description: "Experience learning with a space-themed AI companion",
      cost: 800,
      type: "ai_skin",
      rarity: "legendary",
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-indigo-600 to-purple-600",
      unlocked: false,
      preview: "✨"
    },
    {
      id: "steampunk_ai",
      name: "Steampunk AI",
      description: "Victorian-era mechanical AI with brass and copper aesthetics",
      cost: 300,
      type: "ai_skin",
      rarity: "rare",
      icon: <Brain className="w-6 h-6" />,
      color: "from-amber-600 to-orange-600",
      unlocked: false,
      preview: "⚙️"
    },
    // Feedback Requests
    {
      id: "project_review",
      name: "Project Review Session",
      description: "Get detailed feedback on your DIY project from AI experts",
      cost: 200,
      type: "feedback",
      rarity: "common",
      icon: <MessageSquare className="w-6 h-6" />,
      color: "from-green-600 to-emerald-600",
      unlocked: true
    },
    {
      id: "code_review",
      name: "Code Review",
      description: "Professional code review with suggestions and improvements",
      cost: 400,
      type: "feedback",
      rarity: "rare",
      icon: <MessageSquare className="w-6 h-6" />,
      color: "from-blue-600 to-cyan-600",
      unlocked: true
    },
    // Bonus Missions
    {
      id: "gpt_challenge",
      name: "GPT Challenge Mission",
      description: "Exclusive learning challenge designed by GPT-4",
      cost: 150,
      type: "mission",
      rarity: "common",
      icon: <Target className="w-6 h-6" />,
      color: "from-purple-600 to-pink-600",
      unlocked: true
    },
    {
      id: "advanced_mission",
      name: "Advanced AI Mission",
      description: "Complex problem-solving mission with bonus rewards",
      cost: 600,
      type: "mission",
      rarity: "epic",
      icon: <Target className="w-6 h-6" />,
      color: "from-red-600 to-orange-600",
      unlocked: false
    },
    // Custom Learning Paths
    {
      id: "personalized_path",
      name: "Personalized Learning Path",
      description: "AI-generated custom curriculum based on your goals",
      cost: 350,
      type: "learning_path",
      rarity: "rare",
      icon: <Route className="w-6 h-6" />,
      color: "from-teal-600 to-cyan-600",
      unlocked: true
    },
    {
      id: "accelerated_path",
      name: "Accelerated Mastery Path",
      description: "Intensive learning path for rapid skill development",
      cost: 750,
      type: "learning_path",
      rarity: "legendary",
      icon: <Route className="w-6 h-6" />,
      color: "from-violet-600 to-purple-600",
      unlocked: false
    }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
      case "rare": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "epic": return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
      case "legendary": return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const handlePurchase = (item: MarketplaceItem) => {
    if (tokenBalance.brainBits >= item.cost) {
      setTokenBalance(prev => ({
        ...prev,
        brainBits: prev.brainBits - item.cost
      }))
      // Here you would typically make an API call to purchase the item
      console.log(`Purchased: ${item.name}`)
    }
  }

  const handleClaimReward = (opportunity: EarningOpportunity) => {
    if (opportunity.progress && opportunity.maxProgress && opportunity.progress >= opportunity.maxProgress) {
      setTokenBalance(prev => ({
        ...prev,
        brainBits: prev.brainBits + opportunity.tokens,
        totalEarned: prev.totalEarned + opportunity.tokens
      }))
      // Here you would typically make an API call to claim the reward
      console.log(`Claimed reward: ${opportunity.title}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Token Balance Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {tokenBalance.brainBits.toLocaleString()} Brain Bits
                </h2>
                <p className="text-muted-foreground">Level {tokenBalance.level} • Total Earned: {tokenBalance.totalEarned.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Next Level</span>
                <Badge variant="secondary">Level {tokenBalance.level + 1}</Badge>
              </div>
              <Progress value={tokenBalance.nextLevelProgress} className="w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          <TabsTrigger value="earn" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Earn Tokens
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Marketplace
          </TabsTrigger>
        </TabsList>

        {/* Earn Tokens Tab */}
        <TabsContent value="earn" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earningOpportunities.map((opportunity) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${opportunity.color} rounded-xl flex items-center justify-center`}>
                        {opportunity.icon}
                      </div>
                      <Badge className={`${opportunity.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {opportunity.completed ? 'Completed' : opportunity.type}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{opportunity.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{opportunity.description}</p>
                    
                    {opportunity.progress !== undefined && opportunity.maxProgress && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{opportunity.progress}/{opportunity.maxProgress}</span>
                        </div>
                        <Progress value={(opportunity.progress / opportunity.maxProgress) * 100} />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{opportunity.tokens}</span>
                      </div>
                      
                      {opportunity.progress && opportunity.maxProgress && opportunity.progress >= opportunity.maxProgress ? (
                        <Button 
                          onClick={() => handleClaimReward(opportunity)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Claim Reward
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          <Lock className="w-4 h-4 mr-2" />
                          Locked
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketplaceItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center`}>
                        {item.icon}
                      </div>
                      <Badge className={getRarityColor(item.rarity)}>
                        {item.rarity}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                    
                    {item.preview && (
                      <div className="text-4xl mb-4 text-center">{item.preview}</div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{item.cost}</span>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant={tokenBalance.brainBits >= item.cost ? "default" : "outline"}
                            disabled={!item.unlocked}
                            className={tokenBalance.brainBits >= item.cost ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" : ""}
                            onClick={() => setSelectedItem(item)}
                          >
                            {tokenBalance.brainBits >= item.cost ? (
                              <>
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Purchase
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4 mr-2" />
                                Insufficient
                              </>
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {item.icon}
                              {item.name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-muted-foreground">{item.description}</p>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <span>Cost:</span>
                              <div className="flex items-center gap-2">
                                <Coins className="w-4 h-4 text-yellow-500" />
                                <span className="font-semibold">{item.cost} Brain Bits</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <span>Your Balance:</span>
                              <div className="flex items-center gap-2">
                                <Coins className="w-4 h-4 text-yellow-500" />
                                <span className="font-semibold">{tokenBalance.brainBits}</span>
                              </div>
                            </div>
                            <Button 
                              onClick={() => handlePurchase(item)}
                              disabled={tokenBalance.brainBits < item.cost}
                              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Confirm Purchase
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 