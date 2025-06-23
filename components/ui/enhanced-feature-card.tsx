import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Fun animation variants for kids
const floatingEmojiAnimation = {
  animate: {
    y: [0, -5, 0],
    rotate: [0, 8, -8, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const iconAnimation = {
  animate: {
    scale: [1, 1.1, 1],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

interface EnhancedFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  iconColor: string;
  children?: React.ReactNode;
  glareColor?: string;
  shinySpeed?: number;
  cuteElements?: string[];
}

export const EnhancedFeatureCard: React.FC<EnhancedFeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  gradientFrom,
  gradientTo,
  iconColor,
  children,
  glareColor = "#ffffff",
  shinySpeed = 4,
  cuteElements = ["✨", "🌟", "💖"],
}) => {
  return (
    <motion.div
      className="h-full perspective-1000"
      whileHover={{ scale: 1.05, rotateY: 2, rotateX: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-sm relative overflow-hidden group">
        {/* Shiny effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out opacity-50 dark:via-white/10" />

        {/* Background Glow */}
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500",
            `bg-gradient-to-tr ${gradientFrom} ${gradientTo}`
          )}
          style={{ filter: "blur(30px)" }}
        />
        
        {/* Cute floating emojis */}
        {cuteElements.map((emoji, emojiIndex) => (
          <motion.div
            key={emojiIndex}
            className="absolute text-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"
            style={{
              top: `${20 + emojiIndex * 25}%`,
              left: `${15 + Math.random() * 70}%`,
            }}
            {...floatingEmojiAnimation}
            transition={{
              ...floatingEmojiAnimation.animate.transition,
              duration: 4 + emojiIndex,
              delay: emojiIndex * 0.3
            }}
          >
            {emoji}
          </motion.div>
        ))}

        <CardContent className="p-6 h-full flex flex-col relative z-10">
          <div className="flex items-center mb-4">
            <motion.div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shadow-lg",
                `bg-gradient-to-r ${gradientFrom} ${gradientTo}`
              )}
              {...iconAnimation}
            >
              <Icon className={cn("w-6 h-6", iconColor)} />
            </motion.div>
          </div>
          
          <div className="flex-1">
            <h3
              className="text-xl font-bold mb-3 text-foreground"
            >
              {title}
            </h3>
            
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {description}
            </p>
            
            {children}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 