"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, X, CheckCircle, Star, Zap } from "lucide-react"

interface TokenNotificationProps {
  message: string
  tokens: number
  type: "earned" | "bonus" | "streak" | "achievement"
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

export function TokenNotification({ 
  message, 
  tokens, 
  type, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}: TokenNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for exit animation
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  const getTypeConfig = () => {
    switch (type) {
      case "earned":
        return {
          icon: <Coins className="w-5 h-5" />,
          color: "from-green-500 to-emerald-500",
          bgColor: "from-green-50 to-emerald-50",
          borderColor: "border-green-200"
        }
      case "bonus":
        return {
          icon: <Star className="w-5 h-5" />,
          color: "from-yellow-500 to-orange-500",
          bgColor: "from-yellow-50 to-orange-50",
          borderColor: "border-yellow-200"
        }
      case "streak":
        return {
          icon: <Zap className="w-5 h-5" />,
          color: "from-purple-500 to-pink-500",
          bgColor: "from-purple-50 to-pink-50",
          borderColor: "border-purple-200"
        }
      case "achievement":
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: "from-blue-500 to-cyan-500",
          bgColor: "from-blue-50 to-cyan-50",
          borderColor: "border-blue-200"
        }
      default:
        return {
          icon: <Coins className="w-5 h-5" />,
          color: "from-green-500 to-emerald-500",
          bgColor: "from-green-50 to-emerald-50",
          borderColor: "border-green-200"
        }
    }
  }

  const config = getTypeConfig()

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <Card className={`border-2 ${config.borderColor} shadow-xl bg-gradient-to-br ${config.bgColor} dark:from-gray-800 dark:to-gray-900`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${config.color} rounded-xl flex items-center justify-center text-white`}>
                  {config.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={`bg-gradient-to-r ${config.color} text-white border-0`}>
                      +{tokens} Brain Bits
                    </Badge>
                    <button
                      onClick={() => {
                        setIsVisible(false)
                        setTimeout(onClose, 300)
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-sm font-medium text-foreground">{message}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Coins className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">Token earned</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for managing token notifications
export function useTokenNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    message: string
    tokens: number
    type: "earned" | "bonus" | "streak" | "achievement"
  }>>([])

  const addNotification = (message: string, tokens: number, type: "earned" | "bonus" | "streak" | "achievement" = "earned") => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { id, message, tokens, type }])
    
    // Auto-remove after 6 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 6000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  return {
    notifications,
    addNotification,
    removeNotification
  }
} 