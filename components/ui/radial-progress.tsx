import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface RadialProgressProps {
  value: number; // 0-100
  size?: number;
  color?: string;
  icon?: React.ReactNode;
}

export function RadialProgress({ value, size = 64, color = "#38BDF8", icon }: RadialProgressProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#334155"
          strokeWidth={8}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl">
        {icon || <CheckCircle className="w-6 h-6 text-sky-400" />}
      </span>
    </div>
  );
} 