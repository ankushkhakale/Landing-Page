"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { NavBar } from "@/components/ui/tubelight-navbar"
import { Leaderboard } from "@/components/leaderboard"
import { Footer7 } from "@/components/ui/footer-7"
import {
  Brain,
  Upload,
  MessageCircle,
  Trophy,
  Star,
  Zap,
  Users,
  Shield,
  ChevronRight,
  Sparkles,
  BookOpen,
  Target,
  Heart,
  Gamepad2,
  FileText,
  ImageIcon,
  Video,
  PieChart,
  Home,
  Info,
  Crown,
  Smile,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useMood } from "@/contexts/mood-context"
import ShinyText from "@/components/ShinyText"
import "@/components/ShinyText.css"
import { AnimatedCompetitionButton } from "@/components/ui/AnimatedCompetitionButton"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [moodPopoverOpen, setMoodPopoverOpen] = useState(false)
  const moodPopoverCloseTimeout = useRef<NodeJS.Timeout | null>(null)

  const { user } = useAuth()
  const router = useRouter()
  const { moodEmoji, moodLabel } = useMood()

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/signup")
    }
  }

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const navItems = [
    {
      name: "Home",
      url: "#",
      icon: Home,
      onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
    {
      name: "Features",
      url: "#features",
      icon: Star,
      onClick: () => scrollToSection("features"),
    },
    {
      name: "Working",
      url: "#how-it-works",
      icon: Info,
      onClick: () => scrollToSection("how-it-works"),
    },
    {
      name: "Top Performers",
      url: "#leaderboard",
      icon: Crown,
      onClick: () => scrollToSection("leaderboard"),
    },
  ]

  const logo = (
    <div className="flex items-center space-x-2">
      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
        <Brain className="w-6 h-6 text-white" />
      </div>
      <ShinyText text="BrainBuddy" className="text-2xl font-bold" />
    </div>
  )

  const rightContent = (
    <div className="flex items-center space-x-4">
      <Button
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
        onClick={handleGetStarted}
      >
        {user ? "Dashboard" : "Get Started"}
      </Button>
      <Popover open={moodPopoverOpen} onOpenChange={setMoodPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-blue-400 text-blue-600 hover:bg-blue-50"
            title="Track your mood"
            onMouseEnter={() => {
              if (moodPopoverCloseTimeout.current) clearTimeout(moodPopoverCloseTimeout.current);
              setMoodPopoverOpen(true);
            }}
            onMouseLeave={() => {
              moodPopoverCloseTimeout.current = setTimeout(() => setMoodPopoverOpen(false), 200);
            }}
            onFocus={() => setMoodPopoverOpen(true)}
            onBlur={() => setMoodPopoverOpen(false)}
          >
            {moodEmoji && <span className="text-xl">{moodEmoji}</span>}
            <span className="font-medium">{moodLabel || "Mood"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-64 text-center"
          onMouseEnter={() => {
            if (moodPopoverCloseTimeout.current) clearTimeout(moodPopoverCloseTimeout.current);
            setMoodPopoverOpen(true);
          }}
          onMouseLeave={() => {
            moodPopoverCloseTimeout.current = setTimeout(() => setMoodPopoverOpen(false), 200);
          }}
        >
          <div className="mb-2 text-lg font-semibold">Track your mood</div>
          <div className="mb-4 text-muted-foreground text-sm">See how you're feeling and get suggestions!</div>
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="flex items-center gap-2 text-xl font-bold">
              {moodEmoji && <span>{moodEmoji}</span>}
              <span>{moodLabel || "Mood"}</span>
            </div>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => router.push("/mood")}
          >
            Open Mood Tracker
          </Button>
        </PopoverContent>
      </Popover>
      <div className="md:hidden">
        <ThemeToggle />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <NavBar items={navItems} logo={logo} rightContent={rightContent} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-4 overflow-hidden">
        {/* Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/AI_Generated_Video_Ready_Now.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Background Gradient Overlay Removed */}

        {/* Content Container */}
        <div className="relative z-20 container mx-auto max-w-6xl flex flex-col justify-center min-h-[60vh]">
          <div className="space-y-8 max-w-2xl">
            {/* Badge */}
            <div className="flex justify-start">
              <Badge className="px-4 py-2 bg-white text-blue-700 font-semibold shadow">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Learning for Kids
              </Badge>
            </div>
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight text-left">
                <span className="bg-gradient-to-r from-pink-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
                  Learn Like You Play
                </span>
              </h1>
            </div>
            {/* Subtitle */}
            <div className="max-w-4xl">
              <p className="text-lg sm:text-xl md:text-2xl font-normal text-black leading-relaxed text-left drop-shadow-[0_2px_6px_rgba(255,255,255,0.8)]">
                Meet BrainBuddy - your smart AI companion that transforms boring study sessions into exciting adventures! Perfect for students under 15 who want to make learning feel like their favorite game.
              </p>
            </div>
            {/* CTA Button */}
            <div className="pt-4 flex justify-start">1
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-16 py-7 text-2xl font-bold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                onClick={handleGetStarted}
              >
                <Zap className="w-7 h-7 mr-4" />
                {user ? "Go to Dashboard" : "Start Learning Now"}
              </Button>
            </div>

            {/* Trust indicators removed as requested */}
          </div>
        </div>
        {/* Decorative Blobs */}
        <div className="absolute top-24 left-10 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob dark:bg-purple-800"></div>
        <div className="absolute top-56 right-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000 dark:bg-yellow-800"></div>
        <div className="absolute bottom-24 left-24 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000 dark:bg-pink-800"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Why Kids Love BrainBuddy
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've packed everything your child needs to fall in love with learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Smart Content Generation */}
            <Card className="border-purple-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 dark:border-purple-700">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Smart Content Generation</h3>
                <p className="text-muted-foreground mb-4">
                  Upload PDFs, notes, images, or videos and watch BrainBuddy create personalized quizzes, flowcharts,
                  and summaries just for you!
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  >
                    15+ Questions
                  </Badge>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300">
                    Custom Difficulty
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI Chatbot */}
            <Card className="border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 dark:border-blue-700">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Your AI Study Buddy</h3>
                <p className="text-muted-foreground mb-4">
                  Chat with BrainBuddy anytime! Powered by advanced AI, it gives real-time help, explains concepts, and
                  keeps you motivated.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    Real-time
                  </Badge>
                  <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300">
                    Emotion-aware
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Gamification */}
            <Card className="border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 dark:border-green-700">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Level Up Your Learning</h3>
                <p className="text-muted-foreground mb-4">
                  Earn XP points, maintain streaks, unlock badges, and customize your avatar. Learning has never been
                  this addictive!
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  >
                    XP Points
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                  >
                    Avatars
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Multi-format Support */}
            <Card className="border-orange-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 dark:border-orange-700">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Upload Anything</h3>
                <p className="text-muted-foreground mb-4">
                  PDFs, handwritten notes, images, videos - BrainBuddy understands them all and turns them into
                  interactive learning materials.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                  >
                    PDFs
                  </Badge>
                  <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                    Videos
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card className="border-indigo-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 dark:border-indigo-700">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Track Your Growth</h3>
                <p className="text-muted-foreground mb-4">
                  Beautiful dashboards show your progress, mood trends, and achievements. Parents and teachers can see
                  how you're doing too!
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                  >
                    Analytics
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  >
                    Insights
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Safety & Privacy */}
            <Card className="border-teal-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 dark:border-teal-700">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-green-500 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Safe & Secure</h3>
                <p className="text-muted-foreground mb-4">
                  COPPA and GDPR-K compliant with child-friendly communication. Your data is protected and your learning
                  environment is safe.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                    COPPA
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  >
                    GDPR-K
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              How BrainBuddy Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Getting started is as easy as 1-2-3! Here's how your learning adventure begins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Upload Your Content</h3>
              <p className="text-muted-foreground mb-6">
                Drag and drop your study materials - notes, PDFs, images, or videos. BrainBuddy accepts everything!
              </p>
              <div className="flex justify-center space-x-4">
                <FileText className="w-8 h-8 text-purple-500" />
                <ImageIcon className="w-8 h-8 text-pink-500" />
                <Video className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Choose Your Adventure</h3>
              <p className="text-muted-foreground mb-6">
                Pick your difficulty level, number of questions, and what you want to create - quizzes, flowcharts, or
                summaries.
              </p>
              <div className="flex justify-center space-x-4">
                <Target className="w-8 h-8 text-blue-500" />
                <BookOpen className="w-8 h-8 text-cyan-500" />
                <PieChart className="w-8 h-8 text-indigo-500" />
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Learn & Level Up</h3>
              <p className="text-muted-foreground mb-6">
                Complete your personalized activities, chat with BrainBuddy for help, and earn rewards as you master new
                concepts!
              </p>
              <div className="flex justify-center space-x-4">
                <Trophy className="w-8 h-8 text-green-500" />
                <Star className="w-8 h-8 text-yellow-500" />
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Say Goodbye to Boring Study Sessions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              BrainBuddy solves the biggest problems in traditional learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">😴</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No More Boredom</h3>
                  <p className="text-muted-foreground">
                    Traditional textbooks put kids to sleep. BrainBuddy makes every lesson feel like a game with
                    rewards, challenges, and interactive content.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Fights Screen Addiction</h3>
                  <p className="text-muted-foreground">
                    Instead of mindless scrolling, kids get addicted to learning! Our gamification makes education as
                    engaging as their favorite apps.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Personalized Learning</h3>
                  <p className="text-muted-foreground">
                    One-size-fits-all education doesn't work. BrainBuddy adapts to each child's pace, style, and
                    interests for maximum effectiveness.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Instant Engagement</h3>
                  <p className="text-muted-foreground">
                    No waiting for teachers or parents. BrainBuddy provides immediate feedback, answers, and
                    encouragement 24/7.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Builds Confidence</h3>
                  <p className="text-muted-foreground">
                    Emotional intelligence and positive reinforcement help kids overcome learning anxiety and build
                    genuine confidence in their abilities.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Measurable Progress</h3>
                  <p className="text-muted-foreground">
                    Parents and teachers can track real progress with detailed analytics, mood tracking, and achievement
                    reports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section id="leaderboard" className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Top Performers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See who's leading the pack and climbing the ranks!
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Leaderboard />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to Transform Learning?</h2>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who've already discovered the joy of learning with BrainBuddy
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <AnimatedCompetitionButton />
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-purple-100">
              {/* Trust indicators removed as requested */}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer7 />
    </div>
  )
}