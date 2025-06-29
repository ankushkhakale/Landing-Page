import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AIMoodRadarProps {
  emoji: string;
  mood: string;
  color?: string;
}

export function AIMoodRadar({ emoji, mood, color = "#38BDF8" }: AIMoodRadarProps) {
  return (
    <div className="fixed top-24 right-8 z-40">
      <motion.div
        className={cn(
          "relative flex flex-col items-center justify-center p-6 rounded-3xl backdrop-blur-xl bg-white/10 drop-shadow-2xl border border-white/20",
          "w-40 h-40"
        )}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 32px 8px ${color}55` }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
        <span className="text-6xl z-10 drop-shadow-xl">{emoji}</span>
        <span className="mt-4 text-lg font-bold text-sky-200 z-10 tracking-wide">{mood}</span>
      </motion.div>
    </div>
  );
} 