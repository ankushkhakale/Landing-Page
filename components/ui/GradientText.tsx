"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface GradientTextProps {
  children: React.ReactNode
  colors?: string[]
  animationSpeed?: number
  showBorder?: boolean
  className?: string
}

export default function GradientText({
  children,
  colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"],
  animationSpeed = 5,
  showBorder = false,
  className,
}: GradientTextProps) {
  const [currentColorIndex, setCurrentColorIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % colors.length)
    }, animationSpeed * 1000)

    return () => clearInterval(interval)
  }, [colors.length, animationSpeed])

  const currentColor = colors[currentColorIndex]
  const nextColor = colors[(currentColorIndex + 1) % colors.length]

  return (
    <span
      className={cn(
        "relative inline-block",
        showBorder && "border-2 border-current rounded-lg px-2 py-1",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(45deg, ${currentColor}, ${nextColor})`,
        backgroundSize: "200% 200%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: `gradientShift ${animationSpeed}s ease infinite`,
      }}
    >
      {children}
    </span>
  )
} 