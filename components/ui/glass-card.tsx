import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-2xl bg-white/10 dark:bg-zinc-900/40 backdrop-blur-md border border-white/20 shadow-xl p-8 ${className}`}
      style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)" }}
    >
      {children}
    </div>
  );
};

export default GlassCard; 