"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Coins, TrendingUp, Zap } from "lucide-react"

interface TokenBalanceWidgetProps {
  brainBits: number
  level: number
  nextLevelProgress: number
  showDetails?: boolean
}

export function TokenBalanceWidget({ 
  brainBits, 
  level, 
  nextLevelProgress, 
  showDetails = false 
}: TokenBalanceWidgetProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
        <CardContent className="p-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{brainBits.toLocaleString()}</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Level {level}
                  </Badge>
                </div>
                {showDetails && (
                  <div className="flex items-center gap-1 text-sm opacity-90">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{Math.floor(brainBits * 0.1)} this week</span>
                  </div>
                )}
              </div>
            </div>
            
            {showDetails && (
              <div className="text-right">
                <div className="text-xs opacity-90 mb-1">Next Level</div>
                <Progress value={nextLevelProgress} className="w-20 h-2" />
              </div>
            )}
          </div>

          {/* Animated sparkles on hover */}
          <AnimatePresence>
            {isHovered && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute top-2 right-2"
                >
                  <Zap className="w-4 h-4 text-yellow-300" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: 0.1 }}
                  className="absolute bottom-2 left-2"
                >
                  <Zap className="w-4 h-4 text-yellow-300" />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
} 