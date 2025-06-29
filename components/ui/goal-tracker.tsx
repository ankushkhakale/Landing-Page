import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const goals = [
  { icon: "🎯", label: "Goal Set" },
  { icon: "🧠", label: "Learning" },
  { icon: "⏳", label: "Time On Task" },
];

export function GoalTracker({ active = 1 }: { active?: number }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8 px-8 py-3 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 drop-shadow-2xl">
      {goals.map((goal, i) => (
        <motion.div
          key={goal.label}
          className={cn(
            "flex flex-col items-center gap-1 text-slate-200",
            i === active && "text-sky-300"
          )}
          initial={{ scale: 0.9, opacity: 0.7 }}
          animate={{ scale: i === active ? 1.2 : 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <span className={cn("text-3xl", i === active && "drop-shadow-[0_0_8px_#38BDF8]")}>{goal.icon}</span>
          <span className="text-xs font-semibold tracking-wide mt-1">{goal.label}</span>
        </motion.div>
      ))}
    </div>
  );
} 