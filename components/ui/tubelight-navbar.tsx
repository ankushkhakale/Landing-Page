"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMood } from "@/contexts/mood-context"
import { Leaderboard } from "@/components/leaderboard"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  onClick?: () => void
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  logo?: React.ReactNode
  rightContent?: React.ReactNode
}

export function NavBar({ items, className, logo, rightContent }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.name || "")
  const [isMobile, setIsMobile] = useState(false)
  const { moodEmoji, moodLabel } = useMood()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleItemClick = (item: NavItem) => {
    setActiveTab(item.name)
    if (item.onClick) {
      item.onClick()
    }
  }

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50 pt-4 px-4", className)}>
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        {logo && <div className="flex items-center">{logo}</div>}

        {/* Navigation Items */}
        <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-border py-2 px-2 rounded-full shadow-lg">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name

            return (
              <div
                key={item.name}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-all duration-300",
                  "text-foreground/70 hover:text-foreground",
                  isActive && "text-white",
                )}
              >
                <span className="hidden md:inline relative z-10">{item.name}</span>
                <span className="md:hidden relative z-10">
                  <Icon size={18} strokeWidth={2.5} />
                </span>
                {isActive && (
                  <motion.div
                    layoutId="lamp"
                    className="absolute inset-0 w-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    {/* Tubelight effect */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-2 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 rounded-t-full opacity-80">
                      <div className="absolute w-16 h-8 bg-gradient-to-r from-purple-300/30 via-blue-300/30 to-pink-300/30 rounded-full blur-lg -top-3 -left-2" />
                      <div className="absolute w-12 h-6 bg-gradient-to-r from-purple-400/40 via-blue-400/40 to-pink-400/40 rounded-full blur-md -top-2" />
                      <div className="absolute w-8 h-4 bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-pink-500/50 rounded-full blur-sm -top-1 left-2" />
                    </div>
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right Content */}
        <div className="flex items-center">
          {rightContent}
        </div>
      </div>
    </div>
  )
}
