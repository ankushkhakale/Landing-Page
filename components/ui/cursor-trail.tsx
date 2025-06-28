"use client";

import { useEffect, useState } from "react";

interface CursorTrailProps {
  children?: React.ReactNode;
}

export const CursorTrail = ({ children }: CursorTrailProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <>
      {children}
      {/* Main cursor dot */}
      <div
        className={`fixed pointer-events-none z-50 transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{
          left: mousePosition.x - 4,
          top: mousePosition.y - 4,
        }}
      >
        <div className="w-2 h-2 bg-blue-400 rounded-full shadow-lg animate-pulse"></div>
      </div>

      {/* Cursor trail */}
      <div
        className={`fixed pointer-events-none z-40 transition-opacity duration-300 ${
          isVisible ? "opacity-60" : "opacity-0"
        }`}
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
        }}
      >
        <div className="w-4 h-4 bg-blue-300/30 rounded-full blur-sm animate-pulse"></div>
      </div>

      {/* Outer glow */}
      <div
        className={`fixed pointer-events-none z-30 transition-opacity duration-500 ${
          isVisible ? "opacity-40" : "opacity-0"
        }`}
        style={{
          left: mousePosition.x - 16,
          top: mousePosition.y - 16,
        }}
      >
        <div className="w-8 h-8 bg-blue-200/20 rounded-full blur-md animate-pulse"></div>
      </div>
    </>
  );
}; 