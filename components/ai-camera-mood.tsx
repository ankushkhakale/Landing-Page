'use client';
import React, { useRef, useEffect, useState, createContext } from 'react';
// @ts-ignore
import * as faceapi from 'face-api.js';
import { MoodProvider } from '@/contexts/mood-context';
import type { MoodContextType } from '@/contexts/mood-context';
import { ChartContainer } from "@/components/ui/chart";
import { Switch } from "@/components/ui/switch";
import { Camera } from "lucide-react";
import * as RechartsPrimitive from "recharts";
import { useRouter } from 'next/navigation';
import { Progress } from "@/components/ui/progress";

const MOOD_LABELS: Record<string, string> = {
  overwhelmed: 'Overwhelmed',
  bored: 'Bored',
  tired: 'Tired',
  stressed: 'Stressed',
  frustrated: 'Frustrated',
  focused: 'Focused',
};

const MOOD_SUGGESTIONS: Record<string, string> = {
  overwhelmed: 'Break tasks into smaller steps and tackle them one at a time.',
  bored: 'Try a new activity or challenge yourself with something different.',
  tired: 'Take a short nap or do some light exercise to recharge.',
  stressed: 'Practice deep breathing or mindfulness for a few minutes.',
  frustrated: 'Take a break, stretch, or talk to someone you trust.',
  focused: 'Keep going! You are making great progress.',
};

const MOOD_EMOJIS: Record<string, string> = {
  overwhelmed: '🤯',
  bored: '🥱',
  tired: '😴',
  stressed: '😓',
  frustrated: '😠',
  focused: '😍',
};

const MOOD_DESCRIPTIONS: Record<string, string> = {
  overwhelmed: 'You seem overwhelmed. Take a deep breath and try to focus on one thing at a time.',
  bored: 'You look bored. Maybe try switching up your activity or take a short break!',
  tired: 'You look tired. Consider a quick rest or some light stretching.',
  stressed: 'You seem stressed. Remember to take breaks and care for yourself.',
  frustrated: 'You seem frustrated. Try stepping away for a moment or talking to a friend.',
  focused: 'You look focused! Keep up the great work.',
};

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const MoodContext = createContext<MoodContextType>({
  mood: "neutral",
  moodEmoji: "😐",
  moodLabel: "Neutral",
  setMood: () => {},
});

export const AICameraMood = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mood, setMood] = useState<string>('');
  const [movement, setMovement] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [lastBox, setLastBox] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMood, setPopupMood] = useState<string>('');
  const [moodHistory, setMoodHistory] = useState<{ mood: string; time: number }[]>([]);
  const [showMoodHistory, setShowMoodHistory] = useState(false);
  const [playMusic, setPlayMusic] = useState(false);
  const [focusGoal, setFocusGoal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isReloading, setIsReloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moodWindow, setMoodWindow] = useState<string[]>([]);
  const [stableMood, setStableMood] = useState<string>('neutral');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [noFace, setNoFace] = useState(false);
  const router = useRouter();

  let faceapi: typeof import('face-api.js') | undefined;
  if (typeof window !== 'undefined') {
    faceapi = require('face-api.js');
  }

  // Automated mood check every 3 minutes
  useEffect(() => {
    if (!mood) return;
    const interval = setInterval(() => {
      setPopupMood(mood);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 6000); // Auto-close after 6 seconds
    }, 180000); // 3 minutes
    return () => clearInterval(interval);
  }, [mood]);

  useEffect(() => {
    // Load face-api.js models
    const loadModels = async () => {
      try {
        if (!faceapi) {
          setError('Face detection library not available.');
          return;
        }
        
        const MODEL_URL = '/models'; // Place models in public/models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (e) {
        setError('Failed to load face detection models.');
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!modelsLoaded) return;
    // Start camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => setError('Camera access denied or unavailable.'));
  }, [modelsLoaded]);

  useEffect(() => {
    if (!modelsLoaded || !videoRef.current || !faceapi) return;
    let stopped = false;
    const analyze = async () => {
      if (stopped) return;
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        setTimeout(analyze, 300);
        return;
      }
      try {
        const result = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        if (canvasRef.current) {
          const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        if (result) {
          setNoFace(false);
          // Mood detection
          const expressions = result.expressions as unknown as Record<string, number>;
          const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
          const [topMood, topScore] = sorted[0];
          const [secondMood, secondScore] = sorted[1] || [null, 0];
          const lessFrequentMoods = ['stressed', 'tired', 'frustrated', 'overwhelmed', 'focused'];
          // Prefer less frequent moods if their score is close to the top mood
          if (
            ['happy', 'sad', 'neutral'].includes(topMood) &&
            lessFrequentMoods.includes(secondMood) &&
            (topScore - secondScore) < 0.1 &&
            secondScore > 0.4
          ) {
            setMood(remapMood(secondMood));
          } else if (
            lessFrequentMoods.includes(topMood) && topScore > 0.4
          ) {
            setMood(remapMood(topMood));
          } else if (topScore > 0.6) {
            setMood(remapMood(topMood));
          }
          // Movement detection (simple: compare box position)
          if (lastBox) {
            const dx = Math.abs(result.detection.box.x - lastBox.x);
            const dy = Math.abs(result.detection.box.y - lastBox.y);
            if (dx > 10 || dy > 10) setMovement('Moving');
            else setMovement('Still');
          }
          setLastBox(result.detection.box);
        } else {
          setNoFace(true);
          setMood('');
          setMovement('');
        }
      } catch (e) {
        setError('Face detection failed.');
      }
      setTimeout(analyze, 300);
    };
    analyze();
    return () => { stopped = true; };
  }, [modelsLoaded, lastBox]);

  // Track mood history
  useEffect(() => {
    if (mood) {
      setMoodHistory((prev) =>
        prev.length > 30
          ? [...prev.slice(-29), { mood, time: Date.now() }]
          : [...prev, { mood, time: Date.now() }]
      );
      setLastUpdated(Date.now());
    }
  }, [mood]);

  // Mood smoothing: keep a rolling window of last 7 moods, use mode
  useEffect(() => {
    if (mood) {
      setMoodWindow((prev) => {
        const next = [...prev, mood].slice(-7);
        // Find mode
        const freq: Record<string, number> = {};
        next.forEach((m) => { freq[m] = (freq[m] || 0) + 1; });
        const mode = next.reduce((a, b) => (freq[a] > freq[b] ? a : b), next[0]);
        setStableMood(mode);
        return next;
      });
    }
  }, [mood]);

  // Mood smoothing: collect moods over 8s, update only if most frequent mood is stable >60%
  const MOOD_WINDOW = 8; // seconds
  const [moodBuffer, setMoodBuffer] = useState<{ mood: string, time: number }[]>([]);
  const [lastMoodChange, setLastMoodChange] = useState<number>(Date.now());

  const detectMoodFromCamera = async () => {
    if (!videoRef.current || !faceapi) return;
    setLoading(true);
    try {
      const result = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
      if (result) {
        const expressions = result.expressions as unknown as Record<string, number>;
        const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
        const top = sorted[0][0];
        setMoodBuffer((prev) => [...prev, { mood: top, time: Date.now() }].filter(e => Date.now() - e.time < MOOD_WINDOW * 1000));
      }
    } catch (e) {
      setError('Could not detect mood.');
    } finally {
      setLoading(false);
    }
  };

  // Mood smoothing effect
  useEffect(() => {
    if (moodBuffer.length === 0) return;
    const freq: Record<string, number> = {};
    moodBuffer.forEach((item) => { freq[item.mood] = (freq[item.mood] || 0) + 1; });
    const entries = Object.entries(freq);
    if (entries.length === 0) return;
    const [mode, count] = entries.reduce((a, b) => (a[1] > b[1] ? a : b));
    if (count / moodBuffer.length > 0.6 && mode !== stableMood) {
      setStableMood(mode);
      setLastMoodChange(Date.now());
      setMood(remapMood(mode));
    }
  }, [moodBuffer]);

  const handleRefreshMood = async () => {
    setLoading(true);
    try {
      await detectMoodFromCamera();
    } catch (e) {
      setError('Manual mood detection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = async () => {
    // Optionally save mood data here if needed
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen min-w-screen w-screen h-screen flex items-center justify-center bg-[#0d1117] font-[Inter,sans-serif] p-0 m-0 overflow-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@400;600;700&display=swap');
        .dashboard-flex {
          display: flex;
          flex-direction: row;
          gap: 2rem;
          width: 100vw;
          height: 100vh;
          align-items: stretch;
          justify-content: center;
        }
        @media (max-width: 900px) {
          .dashboard-flex { flex-direction: column; gap: 1.5rem; height: 100vh; }
        }
        .dashboard-card {
          background: #1c1c2b;
          border-radius: 20px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25), 0 1.5px 4px 0 #23243a;
          transition: box-shadow 0.3s cubic-bezier(.4,2,.6,1);
          padding: 2.5rem 2rem;
          position: relative;
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 0;
          height: 90vh;
          margin: auto 0;
        }
        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 8px 32px 0 rgba(31,38,135,0.25);
        }
        .camera-card {
          flex: 0 1 30%;
          min-width: 320px;
          max-width: 480px;
          order: 1;
        }
        .insights-card {
          flex: 0 1 70%;
          min-width: 320px;
          max-width: 1000px;
          order: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: 100%;
        }
        @media (max-width: 900px) {
          .camera-card, .insights-card { max-width: 100vw; width: 100vw; min-width: 0; flex: 1 1 0; order: unset; }
        }
        .insights-emoji {
          font-size: 4.2rem;
          margin-bottom: 0.5rem;
          filter: drop-shadow(0 2px 12px #5f6fff44);
          transition: transform 0.25s cubic-bezier(.4,2,.6,1), opacity 0.25s;
        }
        .insights-emoji.pulse {
          animation: emojiPulse 0.5s;
        }
        @keyframes emojiPulse {
          0% { transform: scale(1); opacity: 1; }
          40% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .insights-label {
          font-size: 1.7rem;
          font-weight: 700;
          color: #e6edf3;
          margin-bottom: 0.2rem;
          letter-spacing: 0.01em;
          text-shadow: 0 2px 8px #23243a44, 0 0 8px #5f6fff33;
          text-align: center;
        }
        .insights-timestamp {
          font-size: 0.98rem;
          color: #00f5d4;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        .insights-desc {
          font-size: 1.08rem;
          color: #b6c2d1;
          margin-bottom: 0.7rem;
          text-align: center;
          max-width: 420px;
        }
        .insights-divider {
          width: 80%;
          border: none;
          border-top: 1.5px solid #5f6fff33;
          margin: 0.7rem auto 0.7rem auto;
        }
        .insights-motivation {
          font-size: 1.08rem;
          color: #5f6fff;
          font-weight: 500;
          margin-bottom: 1.1rem;
          text-align: center;
          max-width: 420px;
        }
        .insights-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 0.7rem;
          width: 100%;
          max-width: 440px;
          margin: 0 auto 0 auto;
        }
        .insights-btn {
          width: 140px;
          height: 44px;
          background: linear-gradient(90deg, #5f6fff 0%, #00f5d4 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1.05rem;
          box-shadow: 0 2px 12px #23243a22;
          transition: all 0.18s cubic-bezier(.4,2,.6,1);
          outline: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          position: relative;
          z-index: 1;
        }
        .insights-btn:focus, .insights-btn:hover {
          background: linear-gradient(90deg, #00f5d4 0%, #5f6fff 100%);
          color: #fff;
          box-shadow: 0 4px 24px #5f6fff44, 0 2px 8px #00f5d488;
          transform: scale(1.05);
        }
        .insights-btn:active {
          background: #23243a;
          color: #fff;
          box-shadow: 0 1px 4px #23243a44;
          transform: scale(0.98);
        }
        .insights-btn[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }
        .insights-btn.empty {
          background: transparent;
          box-shadow: none;
          cursor: default;
          pointer-events: none;
        }
        .insights-footer {
          margin-top: 1.2rem;
          font-size: 0.95rem;
          color: #b6c2d1;
          opacity: 0.7;
          text-align: center;
        }
        @media (max-width: 600px) {
          .insights-buttons { grid-template-columns: 1fr; grid-template-rows: repeat(6, 1fr); gap: 0.5rem; }
          .insights-btn { width: 100%; }
          .insights-card { padding: 1.1rem 0.2rem; }
        }
        .camera-glow {
          box-shadow: 0 0 0 4px #5f6fff44, 0 0 16px 4px #5f6fff88;
          border-image: linear-gradient(90deg, #5f6fff, #00f5d4, #f88379) 1;
          animation: borderGlow 2s linear infinite;
        }
        @keyframes borderGlow {
          0% { box-shadow: 0 0 0 4px #5f6fff44, 0 0 16px 4px #5f6fff88; }
          50% { box-shadow: 0 0 0 6px #00f5d488, 0 0 24px 8px #5f6fff88; }
          100% { box-shadow: 0 0 0 4px #5f6fff44, 0 0 16px 4px #5f6fff88; }
        }
        .status-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #fff;
          background: #23243a;
          box-shadow: 0 2px 8px #0002;
          z-index: 2;
        }
        .status-live { background: #f44336; }
        .status-detecting { background: #ffb300; color: #23243a; }
        .status-idle { background: #00e676; color: #23243a; }
        .snapshot-btn {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          background: #23243a;
          border-radius: 50%;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #5f6fff;
          box-shadow: 0 2px 8px #0002;
          cursor: pointer;
          transition: background 0.2s;
        }
        .snapshot-btn:hover {
          background: #5f6fff;
          color: #fff;
        }
        .loader {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 48px;
          height: 48px;
          border: 4px solid #23243a;
          border-top: 4px solid #5f6fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          z-index: 10;
        }
        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .tooltip {
          position: absolute;
          left: 50%;
          bottom: 120%;
          transform: translateX(-50%);
          background: #23243a;
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.95rem;
          white-space: nowrap;
          box-shadow: 0 2px 8px #0005;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
          z-index: 10;
        }
        .toggle-btn:focus + .tooltip,
        .toggle-btn:hover + .tooltip {
          opacity: 1;
          pointer-events: auto;
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(13, 17, 23, 0.85);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s;
        }
        .modal-content {
          background: #181a23;
          border-radius: 16px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
          padding: 2rem 2.5rem;
          min-width: 320px;
          max-width: 95vw;
          max-height: 80vh;
          overflow-y: auto;
          color: #fff;
          position: relative;
          animation: popIn 0.2s;
        }
        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: #f88379;
          font-size: 1.5rem;
          cursor: pointer;
          z-index: 10;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @media (max-width: 600px) {
          .toggle-btn, .neon-btn { width: 100%; justify-content: center; }
          .flex-wrap { flex-direction: column !important; gap: 0.75rem !important; }
        }
        .insight-btn {
          background: linear-gradient(90deg, #5f6fff 0%, #00f5d4 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-weight: 600;
          font-size: 1.08rem;
          padding: 0.85rem 1.5rem;
          margin: 0.25rem 0.5rem;
          box-shadow: 0 2px 12px #23243a22;
          transition: all 0.18s cubic-bezier(.4,2,.6,1);
          outline: none;
          cursor: pointer;
          position: relative;
          z-index: 1;
        }
        .insight-btn:focus, .insight-btn:hover {
          background: linear-gradient(90deg, #00f5d4 0%, #5f6fff 100%);
          color: #fff;
          box-shadow: 0 4px 24px #5f6fff44, 0 2px 8px #00f5d488;
          transform: translateY(-2px) scale(1.03);
        }
        .insight-btn:active {
          background: #23243a;
          color: #fff;
          box-shadow: 0 1px 4px #23243a44;
          transform: scale(0.98);
        }
        .insight-btn[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }
        @media (max-width: 600px) {
          .insight-btn { width: 100%; margin: 0.5rem 0; }
        }
      `}</style>
      <div className="dashboard-flex">
        <div className="dashboard-card camera-card">
          <span className={`status-badge ${stableMood === 'focused' || movement === 'Moving' ? 'status-live' : movement === 'Still' ? 'status-idle' : 'status-detecting'}`}
            aria-label={stableMood === 'focused' || movement === 'Moving' ? 'Live' : movement === 'Still' ? 'Idle' : 'Detecting'}>
            {stableMood === 'focused' || movement === 'Moving' ? '🔴 LIVE' : movement === 'Still' ? '🟢 Idle' : '🟡 Detecting'}
          </span>
          <h2 className="text-[1.5rem] font-bold text-[#5f6fff] mb-4 tracking-tight">Camera Feed</h2>
          {loading && <div className="loader" aria-label="Loading camera" />}
          <div className={`relative w-full flex justify-center mb-3 ${(stableMood === 'focused' || movement === 'Moving') ? 'camera-glow' : ''}`}
            tabIndex={0} aria-label="Camera feed area">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              width={360}
              height={270}
              className="rounded-xl border-2 border-[#5f6fff] shadow-lg bg-black object-cover"
              style={{ background: '#222', maxWidth: '100%', maxHeight: '270px' }}
            />
            <canvas
              ref={canvasRef}
              width={360}
              height={270}
              className="absolute top-0 left-0 rounded-xl pointer-events-none"
            />
            <button className="snapshot-btn" aria-label="Refresh mood now" onClick={detectMoodFromCamera}>
              <Camera className="w-6 h-6" />
            </button>
          </div>
          <div className="text-xs text-[#ffffff99] mt-2 text-center">(Camera data is processed locally. No video is uploaded.)</div>
          {movement && (
            <div className="text-xs text-[#00f5d4] mt-1">Status: {movement}</div>
          )}
          {error && (
            <div className="text-xs text-[#f88379] mb-2 text-center font-semibold animate-pulse">{error}</div>
          )}
        </div>
        <div className="dashboard-card insights-card">
          {noFace && (
            <div className="text-xs text-[#f88379] mb-2 text-center font-semibold animate-pulse">No user detected. Please ensure your face is visible to the camera.</div>
          )}
          <div className="insights-emoji pulse-emoji select-none" style={{display:'inline-block'}}>{MOOD_EMOJIS[stableMood] || '❓'}</div>
          <div className="insights-label">{capitalize(MOOD_LABELS[stableMood] || stableMood || 'Unknown')}</div>
          <div className="insights-timestamp">Last updated: {new Date(lastMoodChange).toLocaleTimeString()}</div>
          <div className="insights-desc">{MOOD_DESCRIPTIONS[stableMood] || 'No description available.'}</div>
          <hr className="insights-divider" />
          <div className="insights-motivation">{MOOD_SUGGESTIONS[stableMood]}</div>
          <div className="insights-buttons">
            <button className="insights-btn" aria-label="View Mood History" onClick={() => setShowHistoryModal(true)}>
              <span role="img" aria-label="history">📊</span> History
            </button>
            <button className="insights-btn" aria-label="Play Music" onClick={() => setShowMusicModal(true)}>
              <span role="img" aria-label="music">🎧</span> Music
            </button>
            <button className="insights-btn" aria-label="Set Goal" onClick={() => setShowGoalsModal(true)}>
              <span role="img" aria-label="goal">🎯</span> Goal
            </button>
            <button className="insights-btn" aria-label="Back to Dashboard" onClick={handleBackToDashboard}>
              <span role="img" aria-label="dashboard">🏠</span> Dashboard
            </button>
            <button className="insights-btn" aria-label="Refresh Mood" onClick={handleRefreshMood} disabled={loading}>
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.582 9A7.003 7.003 0 0112 5c3.866 0 7 3.134 7 7 0 1.306-.417 2.518-1.126 3.5M18.418 15A7.003 7.003 0 0112 19c-3.866 0-7-3.134-7-7 0-1.306.417-2.518 1.126-3.5"/></svg>
              Refresh
            </button>
            <div className="insights-btn empty" />
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalTimer() {
  const [seconds, setSeconds] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  React.useEffect(() => {
    let interval: any;
    if (running) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [running]);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full"><Progress value={Math.min(100, (seconds / 1800) * 100)} /></div>
      <div className="text-lg font-mono">{mins}:{secs.toString().padStart(2, '0')}</div>
      <div className="flex gap-2 mt-1">
        <button className="insight-btn" onClick={() => setRunning(true)} disabled={running}>Start</button>
        <button className="insight-btn" onClick={() => setRunning(false)} disabled={!running}>Pause</button>
        <button className="insight-btn" onClick={() => { setRunning(false); setSeconds(0); }}>Reset</button>
      </div>
    </div>
  );
}

function MusicCard({ playlist }: { playlist: { name: string, mood: string, url: string, cover: string, tag: string } }) {
  const [playing, setPlaying] = React.useState(false);
  const [volume, setVolume] = React.useState(0.7);
  const [progress, setProgress] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  React.useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);
  React.useEffect(() => {
    if (!audioRef.current) return;
    const updateProgress = () => {
      if (audioRef.current && audioRef.current.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    };
    if (playing) {
      audioRef.current.addEventListener('timeupdate', updateProgress);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateProgress);
      }
    };
  }, [playing]);
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };
  return (
    <div className="rounded-2xl bg-[#23243a] shadow-lg flex flex-col items-center p-4 gap-3 relative group" style={{boxShadow: playing ? '0 0 16px 4px #5f6fff88' : undefined}}>
      <div className="relative mb-2">
        <img src={playlist.cover} alt={playlist.name} className="w-28 h-28 rounded-xl object-cover shadow-lg border-4 border-[#5f6fff33]" />
        {playing && (
          <div className="absolute bottom-2 right-2 flex gap-1 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1.5 h-4 rounded bg-[#5f6fff] animate-bounce" style={{animationDelay: `${i * 0.1}s`}} />
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{MOOD_EMOJIS[playlist.mood]}</span>
        <span className="font-bold text-lg text-[#e6edf3]">{playlist.name}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-[#5f6fff22] text-[#5f6fff] ml-1">{playlist.tag}</span>
      </div>
      <div className="flex items-center gap-2 w-full justify-center">
        <button className="rounded-full bg-[#5f6fff] hover:bg-[#00f5d4] text-white w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00f5d4]" onClick={handlePlayPause} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21 5,3" /></svg>
          )}
        </button>
        <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-24 accent-[#5f6fff]" aria-label="Volume" />
      </div>
      <div className="w-full h-2 bg-[#181a23] rounded-full overflow-hidden mt-2">
        <div className="h-full bg-gradient-to-r from-[#5f6fff] to-[#00f5d4] transition-all" style={{width: `${progress}%`}} />
      </div>
      <audio ref={audioRef} src={playlist.url} onEnded={() => setPlaying(false)} />
    </div>
  );
}

function GoalSelector() {
  const [selected, setSelected] = React.useState(0);
  const goals = [
    'Complete 2 quizzes in 30 minutes',
    'Study for 20 minutes and take a 5-min break',
    'Try a 10-min focused session',
    'Review your notes for 15 minutes',
    'Organize your study space',
  ];
  return (
    <div className="flex flex-col gap-2">
      {goals.map((goal, i) => (
        <button key={i} className={`insight-btn text-left px-4 py-2 ${selected === i ? 'ring-2 ring-[#00f5d4] scale-105' : ''}`} onClick={() => setSelected(i)}>{goal}</button>
      ))}
    </div>
  );
}

function GoalCompleteButton() {
  const [done, setDone] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const handleComplete = () => {
    setDone(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };
  return (
    <div className="flex flex-col items-center mt-4">
      <button className="insight-btn px-6 py-2 text-lg" onClick={handleComplete} disabled={done}>{done ? 'Completed!' : 'Mark as Complete'}</button>
      {showConfetti && <Confetti />}
    </div>
  );
}

function Confetti() {
  // Simple confetti animation using emoji
  return (
    <div className="absolute left-1/2 top-0 -translate-x-1/2 mt-2 pointer-events-none select-none animate-bounce z-50 text-3xl">
      🎉🎊✨
    </div>
  );
}

function remapMood(mood: string): string {
  if (mood === 'happy') return 'overwhelmed';
  if (mood === 'neutral') return 'bored';
  if (mood === 'sad') return 'tired';
  return mood;
}