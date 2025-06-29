import React from "react";

export const ChatBubble: React.FC<{ children: React.ReactNode; variant?: "sent" | "received" }> = ({ children, variant }) => (
  <div className={`flex items-end gap-2 ${variant === "sent" ? "justify-end" : "justify-start"}`}>{children}</div>
);

export const ChatBubbleAvatar: React.FC<{ src?: string; fallback?: string; className?: string }> = ({ src, fallback, className }) => (
  <div className={`rounded-full overflow-hidden bg-gray-700 ${className || "w-8 h-8"}`}>
    {src ? <img src={src} alt="avatar" className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full text-xs text-white">{fallback || "?"}</span>}
  </div>
);

export const ChatBubbleMessage: React.FC<{ children?: React.ReactNode; variant?: "sent" | "received"; isLoading?: boolean }> = ({ children, variant, isLoading }) => (
  <div className={`rounded-xl px-4 py-2 max-w-[75%] text-sm ${variant === "sent" ? "bg-blue-700 text-white" : "bg-zinc-800 text-zinc-100"}`}>{isLoading ? <span className="animate-pulse">...</span> : children}</div>
);

export default ChatBubble; 