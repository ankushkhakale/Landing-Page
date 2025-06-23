import { motion } from "framer-motion";
import React from "react";

interface AnimatedGradientCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function AnimatedGradientCard({ children, className = "" }: AnimatedGradientCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, boxShadow: "0 0 32px 0 rgba(168,85,247,0.25)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative rounded-2xl overflow-hidden group ${className}`}
    >
      {/* Animated Gradient Border */}
      <motion.div
        className="absolute -inset-1 z-0 rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 blur-sm opacity-80 animate-gradient"
        style={{ backgroundSize: "200% 200%", animation: "gradientShift 4s ease-in-out infinite" }}
        aria-hidden
      />
      {/* Card Content */}
      <div className="relative z-10 bg-slate-900/70 border border-white/10 shadow-lg shadow-blue-500/10 backdrop-blur-lg rounded-2xl p-6 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
} 