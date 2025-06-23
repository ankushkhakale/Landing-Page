"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Sparkles, Lightbulb, BrainCircuit } from "lucide-react"
import GradientText from "./GradientText"
import { motion } from "framer-motion"

export function EmpowerSection() {
  const features = [
    {
      icon: Sparkles,
      title: "Boosts Confidence",
      description:
        "Personalized challenges and positive reinforcement help your child build self-esteem and a 'can-do' attitude towards learning.",
      iconColor: "text-purple-400",
      bgColor: "bg-purple-950/20",
    },
    {
      icon: Lightbulb,
      title: "Sparks Curiosity",
      description:
        "Interactive lessons and fun explorations turn learning into a game, encouraging your child to ask questions and discover new interests.",
      iconColor: "text-blue-400",
      bgColor: "bg-blue-950/20",
    },
    {
      icon: BrainCircuit,
      title: "Develops Critical Skills",
      description:
        "Our AI-powered activities focus on problem-solving and creative thinking, preparing your child for future success.",
      iconColor: "text-pink-400",
      bgColor: "bg-pink-950/20",
    },
  ]

  function FlipCard({ children }: { children: React.ReactNode }) {
    const [isFlipped, setIsFlipped] = React.useState(false);
    return (
      <div
        className="relative h-[340px] w-full cursor-pointer"
        style={{ perspective: "1000px" }}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front Side */}
          <div
            className="absolute inset-0 h-full w-full"
            style={{ backfaceVisibility: "hidden" }}
          >
            {children}
          </div>
          {/* Back Side (identical content) */}
          <div
            className="absolute inset-0 h-full w-full"
            style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
          >
            {children}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            <GradientText colors={["#a855f7", "#60a5fa", "#ec4899"]}>
              How BrainBuddy Empowers Your Child
            </GradientText>
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            We go beyond grades, focusing on building confident, curious, and skilled young learners.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FlipCard key={index}>
              <div className="relative h-full w-full">
                {/* Animated Gradient Border */}
                <div className="absolute -inset-1 rounded-2xl z-0 animate-gradient bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 blur-sm opacity-70" style={{ backgroundSize: '200% 200%', animation: 'gradientShift 4s ease-in-out infinite' }} />
                <Card className="relative overflow-visible bg-slate-900/80 border-none backdrop-blur-sm p-6 flex flex-col items-center text-center transition-all duration-300 h-full min-h-[320px] rounded-2xl z-10 shadow-xl">
                  <div className="absolute inset-0 pointer-events-none">
                    <Sparkles className="absolute top-4 right-4 h-4 w-4 text-purple-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
                    <Sparkles className="absolute top-1/4 left-5 h-3 w-3 text-blue-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200" />
                    <Sparkles className="absolute bottom-1/3 right-8 h-5 w-5 text-pink-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300" />
                    <Sparkles className="absolute bottom-4 left-4 h-2 w-2 text-purple-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-400" />
                  </div>
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 border-slate-700 ${feature.bgColor} shadow-lg`}
                  >
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-50 mb-2 drop-shadow-lg">{feature.title}</h3>
                  <p className="text-slate-400 text-sm drop-shadow-md">{feature.description}</p>
                </Card>
              </div>
            </FlipCard>
          ))}
        </div>
      </div>
    </section>
  )
} 