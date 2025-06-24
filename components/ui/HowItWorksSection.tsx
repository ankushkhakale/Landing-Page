"use client"

import { motion } from "framer-motion"
import GradientText from "@/components/ui/GradientText"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Brain, 
  MessageCircle, 
  Trophy, 
  Sparkles, 
  Zap,
  BookOpen,
  Target,
  Gamepad2,
  TrendingUp,
  Star,
  Heart,
  Rocket,
  Crown
} from "lucide-react"

const howItWorksSteps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload & Connect 📁",
    description: "Simply upload your study materials - PDFs, images, or text. BrainBuddy instantly analyzes and understands your content.",
    features: ["Smart Content Analysis", "Multi-format Support", "Instant Processing"],
    gradientFrom: "from-blue-500",
    gradientTo: "to-purple-500",
    iconColor: "text-blue-500",
    delay: 0.2,
    animationType: "bounce",
    emoji: "📚",
    cuteElements: ["⭐", "💫", "✨"]
  },
  {
    step: "02",
    icon: Brain,
    title: "AI Magic Happens 🧠✨",
    description: "Our advanced AI transforms your materials into interactive learning experiences, quizzes, and personalized study guides.",
    features: ["Content Transformation", "Adaptive Learning", "Personalized Content"],
    gradientFrom: "from-purple-500",
    gradientTo: "to-pink-500",
    iconColor: "text-purple-500",
    delay: 0.4,
    animationType: "pulse",
    emoji: "🌟",
    cuteElements: ["💖", "🎯", "🚀"]
  },
  {
    step: "03",
    icon: MessageCircle,
    title: "Interactive Learning 💬",
    description: "Chat with BrainBuddy, ask questions, and get instant explanations. It's like having a brilliant tutor available 24/7.",
    features: ["Real-time Chat", "Smart Explanations", "24/7 Availability"],
    gradientFrom: "from-pink-500",
    gradientTo: "to-rose-500",
    iconColor: "text-pink-500",
    delay: 0.6,
    animationType: "wiggle",
    emoji: "💭",
    cuteElements: ["💡", "🎉", "🌈"]
  },
  {
    step: "04",
    icon: Gamepad2,
    title: "Gamified Experience 🎮",
    description: "Earn points, unlock achievements, and compete with friends. Learning becomes an exciting adventure with rewards at every step.",
    features: ["XP & Levels", "Achievements", "Leaderboards"],
    gradientFrom: "from-emerald-500",
    gradientTo: "to-green-500",
    iconColor: "text-emerald-500",
    delay: 0.8,
    animationType: "shake",
    emoji: "🏆",
    cuteElements: ["🎊", "🔥", "💎"]
  },
  {
    step: "05",
    icon: TrendingUp,
    title: "Track Progress 📊",
    description: "Watch your knowledge grow with detailed analytics, progress charts, and insights into your learning journey.",
    features: ["Progress Analytics", "Performance Insights", "Learning Patterns"],
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-500",
    iconColor: "text-amber-500",
    delay: 1.0,
    animationType: "float",
    emoji: "📈",
    cuteElements: ["🎯", "💪", "👑"]
  }
]

// Fun animation variants for kids
const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  },
  hover: {
    y: -10,
    scale: 1.05,
    rotateY: 5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10
    }
  }
}

const stepNumberVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: { 
    scale: 1, 
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10
    }
  },
  hover: {
    scale: 1.2,
    rotate: 360,
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  }
}

const iconVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 10
    }
  },
  hover: {
    scale: 1.3,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
}

// Cute floating emoji animation
const floatingEmojiAnimation = {
  animate: {
    y: [0, -8, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Fun floating animation
const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Bouncing animation
const bounceAnimation = {
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Pulsing animation
const pulseAnimation = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Wiggle animation
const wiggleAnimation = {
  animate: {
    rotate: [0, 5, -5, 5, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Shake animation
const shakeAnimation = {
  animate: {
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Confetti animation
const confettiAnimation = {
  animate: {
    y: [0, -20],
    opacity: [1, 0],
    rotate: [0, 360],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeOut"
    }
  }
}

export function HowItWorksSection() {
  const getAnimationVariant = (type: string) => {
    switch (type) {
      case "bounce": return bounceAnimation
      case "pulse": return pulseAnimation
      case "wiggle": return wiggleAnimation
      case "shake": return shakeAnimation
      case "float": return floatingAnimation
      default: return floatingAnimation
    }
  }

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20 relative overflow-hidden">
      {/* Floating background elements */}
      <motion.div
        className="absolute top-20 left-10 text-4xl opacity-10"
        animate={{ y: [0, -20, 0], rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        🌟
      </motion.div>
      <motion.div
        className="absolute top-40 right-20 text-3xl opacity-10"
        animate={{ y: [0, 15, 0], rotate: [0, -360] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute bottom-20 left-20 text-3xl opacity-10"
        animate={{ y: [0, -15, 0], rotate: [0, 180] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        💫
      </motion.div>

      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 10,
              delay: 0.2 
            }}
          >
            <Badge className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 dark:from-purple-900/50 dark:to-pink-900/50 dark:text-purple-300 dark:border-purple-700 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-4 h-4 mr-2" />
              </motion.div>
              Simple 5-Step Process 🎯
            </Badge>
          </motion.div>
          <GradientText
            colors={["#ffaa40", "#9c40ff", "#ffaa40"]}
            animationSpeed={4}
            showBorder={false}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            How BrainBuddy Works 🚀
          </GradientText>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From upload to mastery - see how BrainBuddy transforms your learning journey into an exciting adventure! ✨
          </p>
        </motion.div>

        <div className="relative">
          {/* Animated Connection Line */}
          <motion.div 
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 transform -translate-y-1/2 z-0"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: step.delay }}
              >
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 group relative overflow-hidden">
                  {/* Shiny effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out opacity-50 dark:via-white/10" />

                  {/* Animated background particles */}
                  <motion.div
                    className="absolute inset-0 opacity-10"
                    animate={{
                      background: [
                        "radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  {/* Cute floating emojis around the card */}
                  {step.cuteElements.map((emoji, emojiIndex) => (
                    <motion.div
                      key={emojiIndex}
                      className="absolute text-lg opacity-60"
                      style={{
                        top: `${20 + emojiIndex * 20}%`,
                        left: `${10 + emojiIndex * 15}%`,
                      }}
                      {...floatingEmojiAnimation}
                      transition={{
                        duration: 3 + emojiIndex,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: emojiIndex * 0.5
                      }}
                    >
                      {emoji}
                    </motion.div>
                  ))}
                  
                  {/* Step Number */}
                  <motion.div
                    className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    variants={stepNumberVariants}
                    whileHover="hover"
                  >
                    {step.step}
                  </motion.div>
                  
                  {/* Icon with fun animations */}
                  <motion.div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.gradientFrom} ${step.gradientTo} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative`}
                    variants={iconVariants}
                    whileHover="hover"
                    {...getAnimationVariant(step.animationType)}
                  >
                    <step.icon className={`w-8 h-8 ${step.iconColor} text-white`} />
                    {/* Sparkle effect around icon */}
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(147, 51, 234, 0.4)",
                          "0 0 0 10px rgba(147, 51, 234, 0)",
                          "0 0 0 0 rgba(147, 51, 234, 0)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  
                  {/* Content */}
                  <div className="space-y-4 relative z-10">
                    <motion.h3 
                      className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      {step.title}
                      <motion.span
                        className="text-2xl"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {step.emoji}
                      </motion.span>
                    </motion.h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {step.description}
                    </p>
                    
                    {/* Features with staggered animations */}
                    <div className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          className="flex items-center space-x-2"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: step.delay + 0.1 + featureIndex * 0.1 }}
                          whileHover={{ x: 5 }}
                        >
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: featureIndex * 0.2 }}
                          >
                            <Sparkles className="w-4 h-4 text-purple-500" />
                          </motion.div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 