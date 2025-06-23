"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { NavBar } from "@/components/ui/tubelight-navbar"
import { Leaderboard } from "@/components/leaderboard"
import { Footer7 } from "@/components/ui/footer-7"
import { EnhancedFeatureCard } from "@/components/ui/enhanced-feature-card"
import GradientText from "@/components/ui/GradientText"
import { EmpowerSection } from "@/components/ui/EmpowerSection"
import { HowItWorksSection } from "@/components/ui/HowItWorksSection"
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
  Home as HomeIcon,
  Info,
  Crown,
  Lightbulb,
  BrainCircuit,
  TrendingUp,
  Rocket,
  Palette,
  HelpCircle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

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

  const navItems = [
    {
      name: "Home",
      url: "#",
      icon: HomeIcon,
      onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
    {
      name: "Features",
      url: "#features",
      icon: Star,
      onClick: () => scrollToSection("features"),
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
      <GradientText
        colors={["#ffaa40", "#9c40ff", "#ffaa40"]}
        animationSpeed={8}
        showBorder={false}
        className="text-2xl font-bold"
      >
        BrainBuddy
      </GradientText>
    </div>
  )

  const rightContent = (
    <div className="flex items-center space-x-4">
      <div className="hidden md:block">
        <ThemeToggle />
      </div>
      <Button
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
        onClick={handleGetStarted}
      >
        {user ? "Dashboard" : "Get Started"}
      </Button>
      <div className="md:hidden">
        <ThemeToggle />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <NavBar items={navItems} logo={logo} rightContent={rightContent} className="backdrop-blur-xl" />

        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-pink-950/20" />
          <div className="relative z-10 container mx-auto max-w-6xl">
            <div className="text-center space-y-8">
              <div className="flex justify-center">
                <Badge className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 dark:from-purple-900/50 dark:to-pink-900/50 dark:text-purple-300 dark:border-purple-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI-Powered Learning for Kids
                </Badge>
              </div>
              <div className="space-y-4">
                <GradientText
                  colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                  animationSpeed={3}
                  showBorder={false}
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight"
                >
                  Learn Like You Play
                </GradientText>
              </div>
              <div className="max-w-4xl mx-auto">
                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  Meet BrainBuddy - your smart AI companion that transforms boring study sessions into exciting
                  adventures! Perfect for students under 15 who want to make learning feel like their favorite game.
                </p>
              </div>
              <div className="pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                  onClick={handleGetStarted}
                >
                  <Zap className="w-6 h-6 mr-3" />
                  {user ? "Go to Dashboard" : "Start Learning Now"}
                </Button>
              </div>
            </div>
          </div>

          <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-purple-800"></div>
          <div className="absolute top-40 right-10 w-20 h-20 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:bg-yellow-800"></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-800"></div>
        </section>

        <EmpowerSection />
        
        <HowItWorksSection />
        
        <div id="leaderboard" className="py-12 md:py-24 lg:py-32">
            <Leaderboard />
        </div>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <GradientText
                colors={["#ffaa40", "#9c40ff", "#ffaa40"]}
                className="text-4xl md:text-5xl font-bold"
              >
                Why Kids Love BrainBuddy
              </GradientText>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We've packed everything your child needs to fall in love with learning
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <EnhancedFeatureCard
                icon={BrainCircuit}
                title="Learning That Loves Them Back ❤"
                description="BrainBuddy doesn't just teach—it connects. Like the world's most patient tutor, it senses when your child is stuck, bored, or buzzing with curiosity… and adapts in real time."
                gradientFrom="from-rose-500"
                gradientTo="to-pink-500"
                iconColor="text-rose-500"
                glareColor="#ff6b9d"
                shinySpeed={3}
                cuteElements={["💖", "😊", "🤗"]}
              >
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge
                    variant="secondary"
                    className="bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                  >
                    Mood Detection
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300"
                  >
                    Adaptive Content
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  >
                    Encouragement Engine
                  </Badge>
                </div>
              </EnhancedFeatureCard>
              <EnhancedFeatureCard
                icon={TrendingUp}
                title="Watch Your Brilliance Grow 📈"
                description="Every lesson, every 'aha!' moment captured in colorful dashboards. See your knowledge blossom while parents and teachers cheer you on!"
                gradientFrom="from-blue-500"
                gradientTo="to-purple-500"
                iconColor="text-blue-500"
                glareColor="#60a5fa"
                shinySpeed={3.5}
                cuteElements={["🚀", "📈", "🌟"]}
              >
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  >
                    Progress heatmaps
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  >
                    Mood & energy trends
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300"
                  >
                    Skill mastery timelines
                  </Badge>
                </div>
              </EnhancedFeatureCard>
              <EnhancedFeatureCard
                icon={Rocket}
                title="Epic Gaming Experience 🚀"
                description="Transform learning into an epic adventure! Earn XP, unlock rare achievements, collect power-ups, battle in leaderboards, and customize your hero avatar. Every study session feels like playing your favorite game!"
                gradientFrom="from-emerald-500"
                gradientTo="to-green-500"
                iconColor="text-emerald-500"
                glareColor="#34d399"
                shinySpeed={4}
                cuteElements={["🎮", "🏆", "🔥"]}
              >
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                  >
                    XP & Levels
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  >
                    Hero Avatars
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300"
                  >
                    Power-ups
                  </Badge>
                </div>
              </EnhancedFeatureCard>
              <EnhancedFeatureCard
                icon={Palette}
                title="Unleash Creativity & Boost Mood"
                description="Go beyond standard lessons. BrainBuddy can generate stories, poems, or even rap battles about any topic, all tailored to your child's current mood to keep them engaged and motivated."
                gradientFrom="from-amber-500"
                gradientTo="to-yellow-500"
                iconColor="text-amber-500"
                glareColor="#fbbf24"
                shinySpeed={3}
                cuteElements={["🎨", "🎤", "✍️"]}
              >
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                  >
                    Storytelling
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  >
                    Poetry
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                  >
                    Rap Battles
                  </Badge>
                </div>
              </EnhancedFeatureCard>
              <EnhancedFeatureCard
                icon={MessageCircle}
                title="Interaction Patterns & DIYs 🛠️"
                description="Learn by doing! BrainBuddy helps kids design their own study methods, craft DIY learning aids, and discover personalized strategies for success."
                gradientFrom="from-orange-500"
                gradientTo="to-red-500"
                iconColor="text-orange-500"
                glareColor="#f97316"
                shinySpeed={4}
                cuteElements={["🛠️", "💡", "🧩"]}
              >
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                  >
                    DIY Learning Tools
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  >
                    Pattern Recognition
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  >
                    Custom Strategies
                  </Badge>
                </div>
              </EnhancedFeatureCard>
              <EnhancedFeatureCard
                icon={Shield}
                title="The Playful Protector"
                description="Safety First, But Never Boring! Learning should feel free - but always be protected!"
                gradientFrom="from-teal-500"
                gradientTo="to-green-500"
                iconColor="text-teal-500"
                glareColor="#14b8a6"
                shinySpeed={6}
                cuteElements={["🛡️", "😇", "✅"]}
              >
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge
                    variant="secondary"
                    className="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300"
                  >
                    COPPA & GDPR-K certified
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  >
                    Kid-friendly chats
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  >
                    No data funny business
                  </Badge>
                </div>
              </EnhancedFeatureCard>
            </div>
          </div>
        </section>
        
        <Footer7 />
      </main>
    </div>
  )
}
