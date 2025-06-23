import { Zap, User, Shield, BookOpen, Heart, TrendingUp } from "lucide-react";
import AnimatedGradientCard from "@/components/ui/AnimatedGradientCard";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import React from "react";

const features = [
  {
    icon: BookOpen,
    title: "Smart Content Generation",
    description:
      "Break the rules—don't study harder, study smarter. BrainBuddy hacks your notes into quizzes & diagrams while you chill. 😎",
    badges: [
      { text: "15+ Questions", color: "bg-pink-600/20 text-pink-400" },
      { text: "Custom Difficulty", color: "bg-purple-600/20 text-purple-400" },
    ],
  },
  {
    icon: User,
    title: "Your AI Study Buddy",
    description:
      "Stuck? Burned out? BrainBuddy's got your back. Instant help, pep talks, and laser-focused explanations to keep you crushing goals. 💪🔥",
    badges: [
      { text: "Real-time", color: "bg-blue-600/20 text-blue-400" },
      { text: "Emotion-aware", color: "bg-cyan-600/20 text-cyan-400" },
    ],
  },
  {
    icon: Zap,
    title: "Epic Gaming Experience",
    description:
      "Game On! Turn study sessions into an RPG—complete quests (quizzes), loot rare achievements (A+ grades), and level up your BrainHero. Ready to respawn… smarter?",
    badges: [
      { text: "XP & Levels", color: "bg-green-600/20 text-green-400" },
      { text: "Hero Avatars", color: "bg-emerald-600/20 text-emerald-400" },
      { text: "Power-ups", color: "bg-teal-600/20 text-teal-400" },
    ],
  },
  {
    icon: Heart,
    title: "Emotion-Intelligent Learning",
    description:
      "Finally, tech that understands. BrainBuddy reads emotions (through tone, pace, and interaction) and responds like a patient mentor—keeping your child motivated and confident.",
    badges: [
      { text: "Mood Detection", color: "bg-pink-600/20 text-pink-400" },
      { text: "Adaptive Content", color: "bg-purple-600/20 text-purple-400" },
      { text: "Emotional Support", color: "bg-cyan-600/20 text-cyan-400" },
    ],
  },
  {
    icon: TrendingUp,
    title: "Track Your Growth",
    description:
      "No waiting for parent-teacher night! Get gentle updates on their progress, mood patterns, and achievements as they happen.",
    badges: [
      { text: "Analytics", color: "bg-blue-600/20 text-blue-400" },
      { text: "Insights", color: "bg-purple-600/20 text-purple-400" },
    ],
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description:
      "Superhero-Level Security! 🦸♂️\nBrainBuddy has an invisible shield protecting your info—no villains allowed!",
    badges: [
      { text: "COPPA", color: "bg-green-600/20 text-green-400" },
      { text: "GDPR-K", color: "bg-emerald-600/20 text-emerald-400" },
    ],
  },
];

export default function WhyKidsLoveSection() {
  return (
    <section className="w-full py-12 md:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            className="text-lg md:text-2xl font-bold mb-3 max-w-xl mx-auto bg-gradient-to-r from-blue-400 via-emerald-400 to-pink-400 bg-clip-text text-transparent break-words whitespace-normal"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            Why BrainBuddy is Every Kid's Learning Sidekick
          </motion.h2>
          <motion.p
            className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          >
            Packed with tools and magic to spark a love for learning.
          </motion.p>
        </div>

        {/* CardSwap Carousel */}
        <CardSwapCarousel />
      </div>
    </section>
  );
}

function CardSwapCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const cardCount = features.length;

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % cardCount);
    }, 3500);
    return () => clearTimeout(timer);
  }, [index, paused, cardCount]);

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto min-h-[260px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full"
        >
          <AnimatedGradientCard className="flex flex-col items-start justify-between min-h-[260px] h-full group">
            <div className="flex items-center mb-4">
              {React.createElement(features[index].icon, { className: 'w-10 h-10 mr-3 text-purple-400' })}
              <h3 className="text-xl font-bold text-white drop-shadow-lg">
                {features[index].title}
              </h3>
            </div>
            <p className="text-slate-300 mb-4 flex-1">{features[index].description}</p>
            <div className="flex flex-wrap gap-2 mt-auto">
              {features[index].badges.map((badge, i) => (
                <Badge key={i} className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.color}`}>{badge.text}</Badge>
              ))}
            </div>
          </AnimatedGradientCard>
        </motion.div>
      </AnimatePresence>
      {/* Navigation Arrows */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          aria-label="Previous card"
          className="p-2 rounded-full bg-slate-800/60 hover:bg-slate-700 text-white"
          onClick={() => setIndex((prev) => (prev - 1 + cardCount) % cardCount)}
        >
          &#8592;
        </button>
        <button
          aria-label="Next card"
          className="p-2 rounded-full bg-slate-800/60 hover:bg-slate-700 text-white"
          onClick={() => setIndex((prev) => (prev + 1) % cardCount)}
        >
          &#8594;
        </button>
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-2 mt-2">
        {features.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${i === index ? 'bg-blue-400' : 'bg-slate-600'}`}
          />
        ))}
      </div>
    </div>
  );
} 