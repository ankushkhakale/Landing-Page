import React from "react";
// If you have a Lottie file, import Lottie from 'lottie-react' and the animation JSON
// import Lottie from 'lottie-react';
// import robotAnimation from '@/public/robot-wave.json';

const defaultRobotSvg = (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="20" width="48" height="32" rx="12" fill="#7DD3FC" stroke="#2563EB" strokeWidth="2"/>
    <ellipse cx="20" cy="36" rx="4" ry="6" fill="#fff"/>
    <ellipse cx="44" cy="36" rx="4" ry="6" fill="#fff"/>
    <circle cx="20" cy="36" r="2" fill="#2563EB"/>
    <circle cx="44" cy="36" r="2" fill="#2563EB"/>
    <rect x="28" y="44" width="8" height="4" rx="2" fill="#2563EB"/>
    <rect x="30" y="8" width="4" height="12" rx="2" fill="#2563EB"/>
    <circle cx="32" cy="8" r="4" fill="#7DD3FC" stroke="#2563EB" strokeWidth="2"/>
  </svg>
);

interface ActionFigureOverlayProps {
  visible: boolean;
  message: string;
  onHide?: () => void;
  position?: "bottom-right" | "bottom-left";
}

export function ActionFigureOverlay({ visible, message, onHide, position = "bottom-right" }: ActionFigureOverlayProps) {
  return (
    <div
      className={`fixed z-50 ${position === "bottom-right" ? "right-4 bottom-4" : "left-4 bottom-4"} transition-all duration-500 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}
      style={{ maxWidth: 200, maxHeight: 200 }}
      aria-live="polite"
    >
      <div className="flex items-end gap-2 bg-white/90 rounded-2xl shadow-xl p-3 animate-bounce-in">
        {/* Replace with Lottie if available */}
        <div style={{ width: 80, height: 80 }}>
          {defaultRobotSvg}
        </div>
        <div className="font-bold text-indigo-700 text-base drop-shadow max-w-[100px] md:max-w-[140px]">
          {message}
        </div>
      </div>
    </div>
  );
}

// CSS animation (add to your global CSS or module)
// @keyframes bounce-in {
//   0% { transform: translateY(40px) scale(0.9); opacity: 0; }
//   60% { transform: translateY(-10px) scale(1.05); opacity: 1; }
//   100% { transform: translateY(0) scale(1); opacity: 1; }
// }
// .animate-bounce-in { animation: bounce-in 0.7s cubic-bezier(.68,-0.55,.27,1.55); } 