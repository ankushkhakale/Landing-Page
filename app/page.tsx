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
import { EmpowerSection, SimpleStepsSection } from "@/components/ui/EmpowerSection"
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
import WhyKidsLoveSection from "@/components/ui/WhyKidsLoveSection"

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

        <WhyKidsLoveSection />
        <EmpowerSection />
        <SimpleStepsSection />
        
        <div id="leaderboard" className="py-12 md:py-24 lg:py-32">
            <Leaderboard />
        </div>
        
        <Footer7 />
      </main>
    </div>
  )
}
