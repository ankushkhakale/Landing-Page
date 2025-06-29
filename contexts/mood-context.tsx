"use client";
import React, { createContext, useContext, useState } from "react";

const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  neutral: "😐",
  surprised: "😲",
  angry: "😠",
  fearful: "😨",
  disgusted: "😒",
};
const MOOD_LABELS: Record<string, string> = {
  happy: "Happy",
  sad: "Sad",
  neutral: "Neutral",
  surprised: "Surprised",
  angry: "Angry",
  fearful: "Fearful",
  disgusted: "Disgusted",
};

export type MoodContextType = {
  mood: string;
  moodEmoji: string;
  moodLabel: string;
  setMood: (mood: string) => void;
};

const MoodContext = createContext<MoodContextType>({
  mood: "happy",
  moodEmoji: "😊",
  moodLabel: "Happy",
  setMood: () => {},
});

export const useMood = () => useContext(MoodContext);

export const MoodProvider = ({ children }: { children: React.ReactNode }) => {
  const [mood, setMood] = useState("happy");

  return (
    <MoodContext.Provider
      value={{
        mood,
        moodEmoji: mood ? MOOD_EMOJIS[mood] : "",
        moodLabel: mood ? MOOD_LABELS[mood] : "",
        setMood,
      }}
    >
      {children}
    </MoodContext.Provider>
  );
}; 