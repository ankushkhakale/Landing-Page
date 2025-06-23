'use client';
import React, { useRef, useEffect, useState } from 'react';
// @ts-ignore
import * as faceapi from 'face-api.js';

const MOOD_LABELS: Record<string, string> = {
  happy: '😊 You look happy today! Keep smiling! 🎉😃✨',
  sad: '😢 Feeling down? Here\'s a virtual hug! 🤗 Try a fun quiz or take a short break! 💪🌈',
  neutral: '😐 Staying focused! Want to try a new challenge or listen to some music? 🎵',
  surprised: '😲 Something caught your attention! Explore something new or share your thoughts! 💡',
  angry: '😠 Take a deep breath! Maybe a quick walk or a game will help. 🚶‍♂️🎮',
  fearful: '😨 Everything okay? Remember, you\'re safe here! Try some deep breathing. 🧘‍♂️',
  disgusted: '😒 Not enjoying this? Let\'s switch things up or try a different activity! 🔄',
};

const MOOD_SUGGESTIONS: Record<string, string> = {
  happy: 'Keep up the great mood! How about sharing your smile with a friend? 😁 Or try a new quiz to keep the fun going! 🎲',
  sad: 'Let\'s cheer you up! Watch a funny video, chat with a friend, or try a quick game. Remember, you\'re awesome! 🌟',
  neutral: 'Want to spice things up? Try a new activity, listen to your favorite song, or take a creative break! 🎨',
  surprised: 'Curiosity is great! Explore a new topic or ask BrainBuddy something interesting! 🤔',
  angry: 'It\'s okay to feel upset. Try some deep breaths, stretch, or do something you enjoy. You got this! 💪',
  fearful: 'If you\'re feeling anxious, take a few deep breaths or talk to someone you trust. You\'re not alone! 🤝',
  disgusted: 'Not feeling it? Switch tasks or take a short break. Refresh and come back stronger! 🔄',
};

const MOOD_EMOJIS: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  neutral: '😐',
  surprised: '😲',
  angry: '😠',
  fearful: '😨',
  disgusted: '😒',
};

const MOOD_DESCRIPTIONS: Record<string, string> = {
  happy: 'You seem to be in a great mood! Keep spreading positivity.',
  sad: 'You look a bit down. Remember, it\'s okay to feel sad sometimes.',
  neutral: 'You look calm and focused. Stay balanced!',
  surprised: 'You look surprised! Something unexpected happened?',
  angry: 'You seem upset. Take a deep breath and relax.',
  fearful: 'You look a bit anxious. Everything will be alright!',
  disgusted: 'You seem displeased. Maybe try something different?',
};

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export const AICameraMood = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mood, setMood] = useState<string>('');
  const [movement, setMovement] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [lastBox, setLastBox] = useState<any>(null);

  useEffect(() => {
    // Load face-api.js models
    const loadModels = async () => {
      const MODEL_URL = '/models'; // Place models in public/models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
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
    if (!modelsLoaded || !videoRef.current) return;
    let animationId: number;
    const analyze = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        animationId = requestAnimationFrame(analyze);
        return;
      }
      const result = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
      if (canvasRef.current) {
        const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        // Do NOT draw the detection box to avoid the blue box
        // if (result) {
        //   faceapi.draw.drawDetections(canvasRef.current, faceapi.resizeResults(result, dims));
        // }
      }
      if (result) {
        // Mood detection
        const expressions = result.expressions as unknown as Record<string, number>;
        const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
        const top = sorted[0];
        setMood(top[0]);
        // Movement detection (simple: compare box position)
        if (lastBox) {
          const dx = Math.abs(result.detection.box.x - lastBox.x);
          const dy = Math.abs(result.detection.box.y - lastBox.y);
          if (dx > 10 || dy > 10) setMovement('Moving');
          else setMovement('Still');
        }
        setLastBox(result.detection.box);
      } else {
        setMood('');
        setMovement('');
      }
      animationId = requestAnimationFrame(analyze);
    };
    animationId = requestAnimationFrame(analyze);
    return () => cancelAnimationFrame(animationId);
  }, [modelsLoaded, lastBox]);

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-md mx-auto">
      <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 p-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">AI Camera Mood Tracker</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="relative w-full flex justify-center mb-4">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            width={320}
            height={240}
            className="rounded-lg border shadow bg-black"
            style={{ background: '#222' }}
          />
          <canvas
            ref={canvasRef}
            width={320}
            height={240}
            className="absolute top-0 left-0 rounded-lg pointer-events-none"
          />
        </div>
        <div className="w-full flex flex-col items-center">
          {mood && (
            <>
              <div className="flex flex-col items-center mb-2">
                <span className="text-5xl mb-1">{MOOD_EMOJIS[mood]}</span>
                <span className="text-lg font-semibold capitalize text-gray-800 dark:text-gray-100">{capitalize(mood)}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">{MOOD_DESCRIPTIONS[mood]}</span>
              </div>
              <div className="w-full border-t border-gray-200 dark:border-zinc-700 my-4" />
              <div className="text-base font-medium text-center mb-2 text-blue-700 dark:text-blue-300">
                {MOOD_LABELS[mood]}
              </div>
              <div className="text-sm text-center text-gray-700 dark:text-gray-300 mb-2">
                {MOOD_SUGGESTIONS[mood]}
              </div>
            </>
          )}
          {!mood && (
            <div className="text-gray-400 text-center text-base mt-4">Detecting mood...</div>
          )}
          <div className="text-xs text-gray-400 mt-2">(Camera data is processed locally. No video is uploaded.)</div>
          {movement && (
            <div className="text-xs text-gray-500 mt-1">Status: {movement}</div>
          )}
        </div>
      </div>
    </div>
  );
}; 