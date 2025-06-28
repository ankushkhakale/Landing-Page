"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, MessageCircle } from "lucide-react";

const suggestions = [
  { icon: <Sparkles className="w-5 h-5 text-sky-400" />, label: "Teach a topic" },
  { icon: <BookOpen className="w-5 h-5 text-purple-400" />, label: "Get a quiz" },
  { icon: <MessageCircle className="w-5 h-5 text-pink-400" />, label: "Ask AI anything" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/20 backdrop-blur-xl"
            initial={{ scale: 0.95, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <div className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="bg-sky-400/20 text-sky-500 px-2 py-1 rounded-lg text-xs font-mono">Cmd+K</span>
              Command Palette
            </div>
            <div className="flex flex-col gap-3">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 hover:bg-sky-100/80 dark:hover:bg-sky-900/40 transition text-slate-700 dark:text-slate-200 font-semibold"
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 