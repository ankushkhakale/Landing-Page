"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Sparkles, Lightbulb, BrainCircuit } from "lucide-react"
import GradientText from "./GradientText"
import { motion } from "framer-motion"
import CardSwap, { Card as SwapCard } from "@/components/ui/CardSwap"
import GlassCard from "@/components/ui/glass-card"

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

// Simple Steps to Learning Success Section
export function SimpleStepsSection() {
  const steps = [
    {
      step: 'Step 1',
      icon: require('lucide-react').Upload,
      title: "🧠✨ BrainBuddy's Magical Knowledge Cauldron ✨🧠",
      description: "Throw anything into my cauldron—PDFs, scribbled notes, or even a photo of your dog wearing glasses (if it's 'studying'). I'll brew it into:\n\n• Sparkling summaries ⚡\n• Memory potions (a.k.a. mnemonics) 🧪\n• Essay spells ✍️\n• Quiz-tastic enchantments ❓",
      bg: 'bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900',
      badge: 'bg-blue-500 text-white',
      iconBg: 'bg-blue-700',
    },
    {
      step: 'Step 2',
      icon: require('lucide-react').Brain,
      title: "🤖💡 BrainBuddy Reads Your Mood & Crafts Magic",
      description: "I don't just read words—I sense your mood! Whether you're excited, bored, or need a pep talk, I'll create just-right content for you:\n\n• Emotion-aware quizzes 🎭\n• Uplifting study notes 🌈\n• Pep talk pop-ups 💬\n• Adaptive challenges that fit your vibe 🪄",
      bg: 'bg-gradient-to-br from-fuchsia-900 via-purple-800 to-pink-900',
      badge: 'bg-pink-500 text-white',
      iconBg: 'bg-pink-700',
    },
    {
      step: 'Step 3',
      icon: require('lucide-react').Gamepad2,
      title: '🚀 Turn Boring Material Into Epic Challenges',
      description: "Ditch the flashcards—compete, conquer, and level up your knowledge with:\n\n🏆 Trivia Showdowns – Battle classmates (or yourself) in quiz duels.\n\n⏱️ Speed Runs – Beat the clock on rapid-fire questions.\n\n🔓 Unlockable Rewards – Earn badges, streaks, or even *'10 Minutes of TikTok Guilt-Free.'*\n\n🌋 Boss Fights – Tackle mega-hard questions to 'defeat' a unit.",
      bg: 'bg-gradient-to-br from-emerald-900 via-green-800 to-cyan-900',
      badge: 'bg-green-500 text-white',
      iconBg: 'bg-green-700',
    },
    {
      step: 'Step 4',
      icon: require('lucide-react').Award,
      title: '🚀 From Study Grind to Victory Lap—See Your Growth in Real Time!',
      description: "Your brain is getting stronger—let's prove it. Track every win with:\n\n📊 Smart Analytics – See which topics you've mastered (and where you need extra XP).\n\n🏅 Achievement Unlocked! – Earn badges for streaks, high scores & lightning-fast recall.\n\n📅 Study Streaks – Keep the momentum going (don't break the chain!).\n\n🎯 Personalized Goals – Set targets, crush them, and celebrate.",
      bg: 'bg-gradient-to-br from-yellow-900 via-orange-800 to-amber-900',
      badge: 'bg-yellow-400 text-white',
      iconBg: 'bg-yellow-600',
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
            Start Your BrainBuddy Adventure
          </h2>
          <p className="max-w-xl mx-auto text-lg md:text-xl text-muted-foreground">
            Ready, set, learn! Here's how to begin your BrainBuddy journey.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: idx * 0.15, type: "spring", stiffness: 80 }}
              whileHover={{
                scale: 1.06,
                boxShadow: "0 8px 32px 0 rgba(168,85,247,0.25), 0 0 0 4px #a855f7",
                rotate: 2,
              }}
              className="transition-transform duration-300"
            >
              <GlassCard className="flex flex-col min-h-[340px] min-w-[320px] sm:min-w-[360px] lg:min-w-[400px] items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${step.iconBg}`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 drop-shadow-lg">{step.title}</h3>
                <pre className="text-slate-200 text-base flex-1 whitespace-pre-line font-sans bg-transparent border-0 p-0 m-0">{step.description}</pre>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 