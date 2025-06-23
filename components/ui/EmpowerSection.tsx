"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Sparkles, Lightbulb, BrainCircuit } from "lucide-react"
import GradientText from "./GradientText"
import { motion } from "framer-motion"
import CardSwap, { Card as SwapCard } from "@/components/ui/CardSwap"

export function EmpowerSection() {
  const features = [
    {
      icon: Sparkles,
      title: "Ignites Unstoppable Confidence",
      description:
        "Personalized quests and uplifting feedback help your child discover their strengths and celebrate every win—big or small—building a foundation of self-belief that lasts a lifetime.",
      iconColor: "text-purple-400",
      bgColor: "bg-purple-950/20",
    },
    {
      icon: Lightbulb,
      title: "Turns Curiosity into Discovery",
      description:
        "Interactive journeys transform every 'why?' into a 'wow!'—fueling your child's natural wonder with hands-on challenges, creative experiments, and stories that spark a lifelong love of learning.",
      iconColor: "text-blue-400",
      bgColor: "bg-blue-950/20",
    },
    {
      icon: BrainCircuit,
      title: "Cultivates Future-Ready Skills",
      description:
        "From creative problem-solving to teamwork and critical thinking, BrainBuddy's AI-powered adventures equip your child with the essential skills to thrive in a fast-changing world.",
      iconColor: "text-pink-400",
      bgColor: "bg-pink-950/20",
    },
    {
      icon: require("lucide-react").Heart,
      title: "Nurtures Emotional Intelligence",
      description:
        "BrainBuddy helps children recognize and manage their emotions, fostering empathy, resilience, and a positive mindset for lifelong well-being.",
      iconColor: "text-red-400",
      bgColor: "bg-red-950/20",
    },
    {
      icon: require("lucide-react").BookOpen,
      title: "Encourages Lifelong Learning",
      description:
        "With ever-evolving content and adaptive challenges, BrainBuddy inspires a passion for learning that grows with your child, every step of the way.",
      iconColor: "text-green-400",
      bgColor: "bg-green-950/20",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 min-h-[400px]">
          <motion.div
            className="flex-1 flex flex-col items-center lg:items-start justify-center space-y-4 text-center lg:text-left mb-8 lg:mb-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter mb-2">
              Unlock Your Child's Brilliance with BrainBuddy
            </h2>
            <p className="max-w-[600px] text-sm sm:text-base md:text-lg font-medium leading-snug text-muted-foreground">
              Empowering the next generation of thinkers, creators, and leaders—one joyful learning adventure at a time.
            </p>
          </motion.div>
          <div className="flex-1 relative flex justify-center items-center min-h-[400px] w-full">
            <CardSwap width={500} height={340} cardDistance={60} verticalDistance={70} delay={5000} skewAmount={6}>
              {features.map((feature, index) => (
                <SwapCard key={index} customClass="p-6 flex flex-col items-center text-center h-full min-h-[320px] rounded-2xl shadow-xl bg-slate-900/80 border-none backdrop-blur-sm">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 border-slate-700 ${feature.bgColor} shadow-lg`}>
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-50 mb-2 drop-shadow-lg">{feature.title}</h3>
                  <p className="text-slate-400 text-sm drop-shadow-md">{feature.description}</p>
                </SwapCard>
              ))}
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  )
} 