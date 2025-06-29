import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";

const insights = [
  {
    icon: <Sparkles className="w-6 h-6 text-sky-400" />, emoji: "🧠", title: "New Concept Mastered", desc: "AI learned about Newton's Laws of Motion." },
  { icon: <BookOpen className="w-6 h-6 text-purple-400" />, emoji: "📚", title: "Key Fact", desc: "Discovered the water cycle stages." },
  { icon: <Lightbulb className="w-6 h-6 text-pink-400" />, emoji: "💡", title: "Insight", desc: "Understood why plants need sunlight." },
];

export function LearningInsights() {
  return (
    <div className="fixed top-80 right-8 z-40 flex flex-col gap-4 w-72">
      {insights.map((item, i) => (
        <motion.div
          key={i}
          className={cn(
            "flex items-center gap-3 p-4 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 drop-shadow-2xl",
            "hover:scale-[1.03] transition-transform cursor-pointer"
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.15, duration: 0.5, type: "spring" }}
        >
          <span className="text-3xl drop-shadow-xl">{item.emoji}</span>
          <div>
            <div className="font-bold text-sky-100 flex items-center gap-2">{item.icon} {item.title}</div>
            <div className="text-slate-300 text-sm mt-1">{item.desc}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 