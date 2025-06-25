"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Target,
  Trophy,
  Sparkles,
  Zap,
  Heart,
  Shield,
  Star,
  Users,
  TrendingUp,
  Lightbulb,
  Rocket,
} from "lucide-react"

export function EmpowerSection() {
  const features = [
    {
      icon: Brain,
      title: "Smart Learning Paths",
      description: "AI adapts to your child's learning style and pace, creating personalized study journeys.",
      gradient: "from-blue-500 to-purple-500",
      badge: "AI-Powered",
    },
    {
      icon: Target,
      title: "Goal Achievement",
      description: "Set learning goals and watch your child celebrate every milestone with exciting rewards.",
      gradient: "from-green-500 to-teal-500",
      badge: "Motivational",
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description: "Earn badges, unlock achievements, and climb leaderboards to stay motivated.",
      gradient: "from-yellow-500 to-orange-500",
      badge: "Gamified",
    },
    {
      icon: Sparkles,
      title: "Interactive Content",
      description: "Transform boring textbooks into engaging, interactive learning experiences.",
      gradient: "from-pink-500 to-rose-500",
      badge: "Interactive",
    },
    {
      icon: Zap,
      title: "Quick Learning",
      description: "Learn faster with AI-generated summaries, quizzes, and study materials.",
      gradient: "from-purple-500 to-indigo-500",
      badge: "Efficient",
    },
    {
      icon: Heart,
      title: "Emotional Support",
      description: "AI companion that understands emotions and provides encouragement when needed.",
      gradient: "from-red-500 to-pink-500",
      badge: "Supportive",
    },
  ]

  const stats = [
    // { icon: Users, value: "10,000+", label: "Happy Students" },
    { icon: Star, value: "4.9/5", label: "Parent Rating" },
    { icon: TrendingUp, value: "85%", label: "Improvement Rate" },
    { icon: Shield, value: "100%", label: "Safe & Secure" },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-pink-950/20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 dark:from-purple-900/50 dark:to-pink-900/50 dark:text-purple-300 dark:border-purple-700">
              <Lightbulb className="w-4 h-4 mr-2" />
              Empowering Young Minds
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Why Kids Love{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                BrainBuddy
              </span>
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              We've designed every feature with your child's success and happiness in mind. 
              Here's what makes BrainBuddy the perfect learning companion.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 bg-gradient-to-r ${feature.gradient} rounded-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="flex flex-col items-center justify-center space-y-4 mt-16 text-center">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
              Ready to Transform Learning?
            </h3>
            <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
              Join thousands of families who've already discovered the joy of AI-powered learning.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Rocket className="w-4 h-4 text-purple-500" />
              <span>Start learning in minutes</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4 text-green-500" />
              <span>100% safe for kids</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 