"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Youtube, Sparkles, Loader2, FileText, List, Brain, Tag, Copy, Download, Clock } from "lucide-react";
import YouTube, { YouTubeProps } from "react-youtube";

interface VideoAnalysis {
  title: string;
  summary: string;
  keyPoints: string[];
  quiz: {
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
  };
  difficulty: string;
  estimatedReadTime: string;
  tags: string[];
}

export function VideoLearn({ dashboardTab }: { dashboardTab?: string }) {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const playerRef = useRef<any>(null);
  const lastTimeRef = useRef(0); // Track last known time
  const skipTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Track skip timeout
  const isSeekingRef = useRef(false); // Prevent infinite loops during seeking
  const playerReadyRef = useRef(false); // Track if player is ready

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) return;
    setLoading(true);
    setError("");
    setAnalysis(null);
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setQuizScore(0);
    
    try {
      const extractedId = extractVideoId(videoUrl);
      if (!extractedId) {
        throw new Error("Invalid YouTube URL");
      }
      setVideoId(extractedId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Dummy data for demonstration
      const dummyAnalysis: VideoAnalysis = {
        title: "Understanding Photosynthesis: How Plants Convert Sunlight into Energy",
        summary: "This video explains photosynthesis, the process by which plants convert sunlight into energy. It covers how chloroplasts in plant cells capture sunlight, use carbon dioxide and water to produce glucose, and release oxygen as a by-product. The video breaks down photosynthesis into two stages: the light-dependent reactions that capture energy and produce oxygen, and the light-independent reactions (Calvin cycle) that synthesize glucose. It also emphasizes the importance of photosynthesis in supporting life on Earth by providing oxygen and food.",
        keyPoints: [
          "Photosynthesis overview and definition",
          "Role of chloroplasts and chlorophyll",
          "Leaf structure and its role in photosynthesis",
          "Chemical equation of photosynthesis",
          "Light-dependent reactions",
          "Light-independent reactions (Calvin Cycle)",
          "Importance of photosynthesis for life and the environment"
        ],
        quiz: {
          questions: [
            {
              question: "What is the main purpose of photosynthesis?",
              options: [
                "To produce oxygen for animals",
                "To convert sunlight into chemical energy",
                "To absorb water from the soil",
                "To release carbon dioxide"
              ],
              correctAnswer: 1,
              explanation: "The main purpose of photosynthesis is to convert sunlight into chemical energy (glucose) that plants can use for growth and survival. While oxygen is produced as a by-product, the primary goal is energy conversion."
            },
            {
              question: "Where in the plant cell does photosynthesis occur?",
              options: [
                "Mitochondria",
                "Chloroplast",
                "Nucleus",
                "Ribosome"
              ],
              correctAnswer: 1,
              explanation: "Photosynthesis occurs in the chloroplasts, which are specialized organelles containing chlorophyll and other pigments that can capture sunlight and convert it into chemical energy."
            },
            {
              question: "Which pigment is responsible for absorbing sunlight in photosynthesis?",
              options: [
                "Carotene",
                "Chlorophyll",
                "Xanthophyll",
                "Hemoglobin"
              ],
              correctAnswer: 1,
              explanation: "Chlorophyll is the primary pigment responsible for absorbing sunlight in photosynthesis. It gives plants their green color and is essential for capturing light energy."
            },
            {
              question: "What are the two main stages of photosynthesis?",
              options: [
                "Glycolysis and Krebs cycle",
                "Light-dependent and light-independent reactions",
                "Fermentation and respiration",
                "Transpiration and respiration"
              ],
              correctAnswer: 1,
              explanation: "Photosynthesis consists of two main stages: light-dependent reactions (which capture light energy and produce oxygen) and light-independent reactions or the Calvin cycle (which synthesize glucose)."
            },
            {
              question: "What gas is released as a by-product during photosynthesis?",
              options: [
                "Carbon dioxide",
                "Nitrogen",
                "Oxygen",
                "Methane"
              ],
              correctAnswer: 2,
              explanation: "Oxygen is released as a by-product during photosynthesis, specifically during the light-dependent reactions when water molecules are split to provide electrons for the process."
            }
          ]
        },
        difficulty: "Beginner",
        estimatedReadTime: "10 min read",
        tags: ["Photosynthesis", "Biology", "Chloroplast", "Light-dependent reactions", "Calvin cycle", "Plant biology", "Oxygen production", "Glucose synthesis", "Science education", "Environmental science"]
      };

      setAnalysis(dummyAnalysis);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Quiz functions
  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (quizSubmitted) return; // Prevent changes after submission
    
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleQuizSubmit = () => {
    if (!analysis) return;
    
    let correctCount = 0;
    analysis.quiz.questions.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / analysis.quiz.questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleQuizReset = () => {
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const getAnswerStatus = (questionIndex: number, optionIndex: number) => {
    if (!quizSubmitted) {
      return quizAnswers[questionIndex] === optionIndex ? 'selected' : 'default';
    }
    
    const question = analysis?.quiz.questions[questionIndex];
    if (!question) return 'default';
    
    if (optionIndex === question.correctAnswer) {
      return 'correct';
    } else if (quizAnswers[questionIndex] === optionIndex) {
      return 'incorrect';
    }
    return 'default';
  };

  const getScoreMessage = () => {
    if (quizScore >= 90) return "Excellent! You have a great understanding of this topic!";
    if (quizScore >= 80) return "Great job! You understand most of the concepts well.";
    if (quizScore >= 70) return "Good work! You have a solid foundation.";
    if (quizScore >= 60) return "Not bad! Review the explanations to improve your understanding.";
    return "Keep studying! Review the material and try again.";
  };

  // Pause video when tab changes
  useEffect(() => {
    if (dashboardTab !== "video-learn" && playerRef.current) {
      playerRef.current.internalPlayer.pauseVideo();
    }
  }, [dashboardTab]);

  // YouTube player options
  const ytOpts = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
    },
  };

  // When the player is ready, initialize tracking
  const onReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
    playerReadyRef.current = true;
    lastTimeRef.current = 0;
    isSeekingRef.current = false;
    console.log('Player ready, skip prevention active');
  };

  // Track time and detect skips
  const onStateChange: YouTubeProps["onStateChange"] = (event) => {
    if (!playerRef.current || !playerReadyRef.current || isSeekingRef.current) return;

    try {
      const currentTime = event.target.getCurrentTime();
      const lastTime = lastTimeRef.current;
      
      // Only check for skips if we have a valid last time and the video is playing
      if (lastTime > 0 && event.data === 1) { // 1 = playing
        const timeDifference = currentTime - lastTime;
        
        // If user skipped ahead more than 5 seconds
        if (timeDifference > 5) {
          console.log(`Skip detected: jumped from ${lastTime}s to ${currentTime}s (${timeDifference}s difference)`);
          isSeekingRef.current = true;
          
          // Clear any existing timeout
          if (skipTimeoutRef.current) {
            clearTimeout(skipTimeoutRef.current);
          }
          
          // Set timeout to return to previous position after 2 seconds
          skipTimeoutRef.current = setTimeout(() => {
            if (playerRef.current && playerReadyRef.current) {
              console.log(`Returning to ${lastTime}s - skipping ahead is not allowed`);
              playerRef.current.seekTo(lastTime, true);
              // Reset seeking flag after seeking
              setTimeout(() => {
                isSeekingRef.current = false;
              }, 500);
            }
          }, 2000);
        } else {
          // Normal progression, update last time
          lastTimeRef.current = currentTime;
        }
      } else if (event.data === 1) {
        // Video started playing, initialize last time
        lastTimeRef.current = currentTime;
      }
    } catch (error) {
      console.log('Error tracking video time:', error);
    }
  };

  // Update time tracking every second for more accurate detection
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (playerRef.current && videoId && playerReadyRef.current) {
      interval = setInterval(() => {
        if (playerRef.current && playerReadyRef.current && !isSeekingRef.current) {
          try {
            const currentTime = playerRef.current.getCurrentTime();
            const playerState = playerRef.current.getPlayerState();
            
            // Only update if video is playing and not seeking
            if (playerState === 1) { // 1 = playing
              lastTimeRef.current = currentTime;
            }
          } catch (error) {
            // Player might not be ready
          }
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
    };
  }, [videoId, playerReadyRef.current]);

  // Reset tracking when video changes
  useEffect(() => {
    lastTimeRef.current = 0;
    isSeekingRef.current = false;
    playerReadyRef.current = false;
    if (skipTimeoutRef.current) {
      clearTimeout(skipTimeoutRef.current);
    }
  }, [videoId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Learning
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent leading-tight">
            Video Learning Hub
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Transform any YouTube video into an interactive learning experience with AI-generated summaries, key insights, and personalized quizzes.
          </p>
        </div>

        {/* Video Input Section */}
        <Card className="border border-gray-700 shadow-xl bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">
                  Video Analysis
                </CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  Enter a YouTube URL to extract transcript and generate educational content
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={loading}
                  className="h-12 text-base border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                />
              </div>
              <Button 
                onClick={handleAnalyze} 
                disabled={loading || !videoUrl}
                className="h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze Video
                  </>
                )}
              </Button>
            </div>
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-900/50 border border-red-700 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 font-medium">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Large Video Player Section */}
        {videoId && (
          <div className="w-full flex justify-center">
            <div className="w-full max-w-5xl">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1 rounded-2xl shadow-2xl">
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
                  <YouTube
                    videoId={videoId}
                    opts={ytOpts}
                    onReady={onReady}
                    onStateChange={onStateChange}
                    className="w-full h-full"
                  />
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/50 text-green-300 rounded-full text-sm font-medium border border-green-700">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Skip Prevention Active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysis && (
          <div className="space-y-8">
            {/* Content Tabs */}
            <Card className="border border-gray-700 shadow-xl bg-gray-800/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-white">
                        {analysis.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 border-blue-600 text-blue-300 bg-blue-900/30">
                        <Clock className="w-3 h-3" />
                        {analysis.estimatedReadTime}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 border-green-600 text-green-300 bg-green-900/30">
                        <Tag className="w-3 h-3" />
                        {analysis.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(analysis.summary)}
                      className="border-gray-600 text-gray-300 hover:border-purple-500 hover:bg-purple-900/30 hover:text-purple-300 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(analysis.summary, 'video-summary.txt')}
                      className="border-gray-600 text-gray-300 hover:border-purple-500 hover:bg-purple-900/30 hover:text-purple-300 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b border-gray-700 bg-gray-900">
                    <TabsList className="grid w-full grid-cols-4 h-14 bg-transparent border-0 gap-1 p-2">
                      <TabsTrigger 
                        value="summary" 
                        className="flex items-center gap-2 data-[state=active]:bg-gray-800 data-[state=active]:text-purple-400 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-gray-300 hover:text-white"
                      >
                        <FileText className="w-4 h-4" />
                        Summary
                      </TabsTrigger>
                      <TabsTrigger 
                        value="keypoints" 
                        className="flex items-center gap-2 data-[state=active]:bg-gray-800 data-[state=active]:text-purple-400 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-gray-300 hover:text-white"
                      >
                        <List className="w-4 h-4" />
                        Key Points
                      </TabsTrigger>
                      <TabsTrigger 
                        value="quiz" 
                        className="flex items-center gap-2 data-[state=active]:bg-gray-800 data-[state=active]:text-purple-400 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-gray-300 hover:text-white"
                      >
                        <Brain className="w-4 h-4" />
                        Quiz
                      </TabsTrigger>
                      <TabsTrigger 
                        value="tags" 
                        className="flex items-center gap-2 data-[state=active]:bg-gray-800 data-[state=active]:text-purple-400 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-gray-300 hover:text-white"
                      >
                        <Tag className="w-4 h-4" />
                        Tags
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="p-6">
                    <TabsContent value="summary" className="mt-0">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-400" />
                          Summary
                        </h3>
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
                          <p className="text-gray-300 leading-relaxed text-base">
                            {analysis.summary}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="keypoints" className="mt-0">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                          <List className="w-5 h-5 text-purple-400" />
                          Key Points
                        </h3>
                        <div className="grid gap-4">
                          {analysis.keyPoints.map((point, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700 hover:border-purple-600 transition-all duration-200">
                              <Badge className="flex-shrink-0 mt-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">
                                {index + 1}
                              </Badge>
                              <p className="text-gray-300 font-medium">{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="quiz" className="mt-0">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-400" />
                            Quiz Questions
                          </h3>
                          {quizSubmitted && (
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-white">{quizScore}%</div>
                                <div className="text-sm text-gray-400">Score</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-white">
                                  {analysis.quiz.questions.filter((_, index) => quizAnswers[index] === analysis.quiz.questions[index].correctAnswer).length}/{analysis.quiz.questions.length}
                                </div>
                                <div className="text-sm text-gray-400">Correct</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {quizSubmitted && (
                          <div className="p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-600 rounded-xl">
                            <p className="text-purple-200 text-center font-medium">{getScoreMessage()}</p>
                          </div>
                        )}

                        <div className="space-y-6">
                          {analysis.quiz.questions.map((question, index) => (
                            <Card key={index} className="border border-gray-700 shadow-lg bg-gray-800 hover:shadow-xl transition-shadow duration-200">
                              <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {index + 1}
                                  </div>
                                  <h4 className="font-semibold text-white text-lg">Question {index + 1}</h4>
                                  {quizSubmitted && (
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                                      quizAnswers[index] === question.correctAnswer 
                                        ? 'bg-green-900/50 text-green-300 border border-green-600'
                                        : 'bg-red-900/50 text-red-300 border border-red-600'
                                    }`}>
                                      {quizAnswers[index] === question.correctAnswer ? 'Correct' : 'Incorrect'}
                                    </div>
                                  )}
                                </div>
                                <p className="text-gray-300 text-base font-medium">{question.question}</p>
                                <div className="space-y-3">
                                  {question.options.map((option, optionIndex) => {
                                    const status = getAnswerStatus(index, optionIndex);
                                    return (
                                      <div
                                        key={optionIndex}
                                        onClick={() => handleAnswerSelect(index, optionIndex)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                                          status === 'selected' && !quizSubmitted
                                            ? 'bg-purple-900/30 border-purple-500 text-purple-200'
                                            : status === 'correct'
                                            ? 'bg-green-900/50 border-green-600 text-green-300 shadow-sm'
                                            : status === 'incorrect'
                                            ? 'bg-red-900/50 border-red-600 text-red-300 shadow-sm'
                                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-purple-600 hover:bg-gray-700'
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${
                                            status === 'selected' && !quizSubmitted
                                              ? 'bg-purple-500 border-purple-500 text-white'
                                              : status === 'correct'
                                              ? 'bg-green-500 border-green-500 text-white'
                                              : status === 'incorrect'
                                              ? 'bg-red-500 border-red-500 text-white'
                                              : 'border-gray-500 text-gray-400'
                                          }`}>
                                            {String.fromCharCode(65 + optionIndex)}
                                          </div>
                                          <span className="font-medium">{option}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="mt-4 p-4 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-700 rounded-xl">
                                  <p className="text-blue-300 text-sm">
                                    <strong className="text-blue-200">Explanation:</strong> {question.explanation}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>

                        <div className="flex justify-center gap-4 pt-4">
                          {!quizSubmitted ? (
                            <Button
                              onClick={handleQuizSubmit}
                              disabled={quizAnswers.length !== analysis.quiz.questions.length}
                              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                              Submit Quiz
                            </Button>
                          ) : (
                            <Button
                              onClick={handleQuizReset}
                              className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                            >
                              Try Again
                            </Button>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="tags" className="mt-0">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                          <Tag className="w-5 h-5 text-purple-400" />
                          Tags & Categories
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {analysis.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 border border-gray-600 hover:border-purple-600 hover:bg-gradient-to-r hover:from-purple-900/30 hover:to-pink-900/30 transition-all duration-200"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border border-gray-700 shadow-lg bg-gray-800/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">YouTube Integration</h3>
              <p className="text-sm text-gray-300">
                Extract content from any YouTube video with seamless integration
              </p>
            </CardContent>
          </Card>
          <Card className="border border-gray-700 shadow-lg bg-gray-800/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">AI Analysis</h3>
              <p className="text-sm text-gray-300">
                Advanced AI-powered content analysis and insights generation
              </p>
            </CardContent>
          </Card>
          <Card className="border border-gray-700 shadow-lg bg-gray-800/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Smart Summaries</h3>
              <p className="text-sm text-gray-300">
                Generate concise, comprehensive summaries with key insights
              </p>
            </CardContent>
          </Card>
          <Card className="border border-gray-700 shadow-lg bg-gray-800/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <List className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Key Points</h3>
              <p className="text-sm text-gray-300">
                Extract main concepts and insights for better understanding
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 