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
    },
    {
      icon: Lightbulb,
      title: "Turns Curiosity into Discovery",
      description:
        "Interactive journeys transform every 'why?' into a 'wow!'—fueling your child's natural wonder with hands-on challenges, creative experiments, and stories that spark a lifelong love of learning.",
      iconColor: "text-blue-400",
    },
    {
      icon: BrainCircuit,
      title: "Cultivates Future-Ready Skills",
      description:
        "From creative problem-solving to teamwork and critical thinking, BrainBuddy's AI-powered adventures equip your child with the essential skills to thrive in a fast-changing world.",
      iconColor: "text-pink-400",
    },
    {
      icon: require("lucide-react").Heart,
      title: "Nurtures Emotional Intelligence",
      description:
        "BrainBuddy helps children recognize and manage their emotions, fostering empathy, resilience, and a positive mindset for lifelong well-being.",
      iconColor: "text-rose-400",
    },
    {
      icon: require("lucide-react").BookOpen,
      title: "Encourages Lifelong Learning",
      description:
        "With ever-evolving content and adaptive challenges, BrainBuddy inspires a passion for learning that grows with your child, every step of the way.",
      iconColor: "text-emerald-400",
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
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-2 max-w-2xl mx-auto bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              Unlock Your Child's Brilliance with BrainBuddy
            </motion.h2>
            <motion.p
              className="max-w-xl mx-auto text-lg sm:text-xl md:text-2xl font-medium leading-snug bg-gradient-to-r from-blue-400 via-emerald-400 to-pink-400 bg-clip-text text-transparent drop-shadow-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
            >
              Empowering the next generation of thinkers, creators, and leaders—one joyful learning adventure at a time.
            </motion.p>
          </motion.div>
          <div className="flex-1 relative flex justify-center items-center min-h-[400px] w-full">
            <CardSwap width={500} height={340} cardDistance={60} verticalDistance={70} delay={5000} skewAmount={6}>
              {features.map((feature, index) => (
                <SwapCard key={index} customClass={
                  `p-6 flex flex-col items-center text-center h-full min-h-[320px] rounded-2xl border border-white/10 shadow-lg shadow-blue-500/10 backdrop-blur-lg transition-transform duration-300 bg-slate-800/70 group`
                }>
                  {/* Animated Gradient Border */}
                  <motion.div
                    className="absolute -inset-1 z-0 rounded-2xl bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 blur-sm opacity-80 animate-gradient"
                    style={{ backgroundSize: '200% 200%', animation: 'gradientShift 4s ease-in-out infinite' }}
                    aria-hidden
                  />
                  <motion.div
                    className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 border-white/30 shadow-lg bg-white/20`}
                    animate={{ scale: [1, 1.13, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  >
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </motion.div>
                  <h3 className="relative z-10 text-2xl font-extrabold text-white mb-2 drop-shadow-xl">{feature.title}</h3>
                  <p className="relative z-10 text-white/90 text-base drop-shadow-lg">{feature.description}</p>
                </SwapCard>
              ))}
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  )
} 