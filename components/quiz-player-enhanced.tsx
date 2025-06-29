"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Trophy, Star, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Quiz {
  id: string
  title: string
  questions: Question[]
  difficulty_level: string
  total_questions: number
}

interface QuizPlayerProps {
  quiz: Quiz
  onComplete: (score: number, totalQuestions: number, timeSpent: number) => void
  onClose: () => void
}

export function QuizPlayerEnhanced({ quiz, onComplete, onClose }: QuizPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [reviewQuestion, setReviewQuestion] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime] = useState(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      finishQuiz()
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const finishQuiz = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const score = selectedAnswers.reduce((acc, answer, index) => {
      return acc + (answer === quiz.questions[index].correctAnswer ? 1 : 0)
    }, 0)

    setShowResults(true)

    try {
      // Save quiz attempt to database
      await supabase.from("quiz_attempts").insert({
        user_id: user?.id,
        quiz_id: quiz.id,
        score,
        total_questions: quiz.questions.length,
        time_taken_seconds: timeSpent,
        answers: selectedAnswers,
      })

      // Determine subject based on quiz title (you can enhance this logic)
      const subject = determineSubject(quiz.title)

      // Update subject progress
      await supabase.rpc("update_subject_progress", {
        user_id: user?.id,
        subject_name: subject,
        quiz_score: score,
        total_questions: quiz.questions.length,
      })

      // Update user progress with proper XP calculation
      const xpGained = calculateXP(score, quiz.questions.length, quiz.difficulty_level)
      const progressResult = await supabase.rpc("update_user_progress", {
        user_id: user?.id,
        xp_to_add: xpGained,
        quiz_completed: true,
        study_time_minutes: Math.floor(timeSpent / 60),
      })

      console.log("Progress update result:", progressResult)

      onComplete(score, quiz.questions.length, timeSpent)
    } catch (error) {
      console.error("Error saving quiz attempt:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const determineSubject = (title: string): string => {
    const titleLower = title.toLowerCase()
    if (titleLower.includes("math") || titleLower.includes("algebra") || titleLower.includes("geometry")) {
      return "Mathematics"
    } else if (titleLower.includes("science") || titleLower.includes("physics") || titleLower.includes("chemistry")) {
      return "Science"
    } else if (titleLower.includes("english") || titleLower.includes("literature") || titleLower.includes("reading")) {
      return "English"
    } else if (titleLower.includes("history") || titleLower.includes("social")) {
      return "History"
    } else if (titleLower.includes("geography")) {
      return "Geography"
    } else {
      return "General Knowledge"
    }
  }

  const calculateXP = (score: number, totalQuestions: number, difficulty: string): number => {
    const baseXP = score * 10 // 10 XP per correct answer
    const difficultyMultiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 1.5 : 2
    const perfectBonus = score === totalQuestions ? 50 : 0 // Bonus for perfect score
    return Math.floor(baseXP * difficultyMultiplier) + perfectBonus
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage === 100) return "Perfect! Outstanding work! 🌟"
    if (percentage >= 90) return "Excellent! You're a star! ⭐"
    if (percentage >= 80) return "Great job! Well done! 👏"
    if (percentage >= 70) return "Good work! Keep it up! 👍"
    if (percentage >= 60) return "Not bad! You can do better! 💪"
    return "Keep practicing! You'll improve! 📚"
  }

  // Review Mode
  if (showReview) {
    const question = quiz.questions[reviewQuestion]
    const userAnswer = selectedAnswers[reviewQuestion]
    const isCorrect = userAnswer === question.correctAnswer

    return (
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <span>Review Mode - Question {reviewQuestion + 1}</span>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-white" onClick={() => setShowReview(false)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Results
              </Button>
              <Button variant="ghost" className="text-white" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{question.question}</h3>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    index === question.correctAnswer
                      ? "border-green-500 bg-green-50"
                      : index === userAnswer && !isCorrect
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        index === question.correctAnswer
                          ? "border-green-500 bg-green-500"
                          : index === userAnswer && !isCorrect
                            ? "border-red-500 bg-red-500"
                            : "border-gray-300"
                      }`}
                    >
                      {index === question.correctAnswer && <CheckCircle className="w-4 h-4 text-white" />}
                      {index === userAnswer && !isCorrect && <XCircle className="w-4 h-4 text-white" />}
                    </div>
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                    <span className={index === question.correctAnswer ? "font-bold text-green-700" : ""}>{option}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">Explanation:</h4>
              <p className="text-blue-700">{question.explanation}</p>
            </div>

            {userAnswer !== undefined && (
              <div className="mt-4 p-4 rounded-lg bg-gray-50">
                <p className="font-medium">
                  Your answer:{" "}
                  <span className={isCorrect ? "text-green-600" : "text-red-600"}>{question.options[userAnswer]}</span>
                </p>
                <p className="font-medium">
                  Correct answer: <span className="text-green-600">{question.options[question.correctAnswer]}</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setReviewQuestion(Math.max(0, reviewQuestion - 1))}
              disabled={reviewQuestion === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <span className="text-sm text-gray-500 self-center">
              {reviewQuestion + 1} of {quiz.questions.length}
            </span>

            <Button
              variant="outline"
              onClick={() => setReviewQuestion(Math.min(quiz.questions.length - 1, reviewQuestion + 1))}
              disabled={reviewQuestion === quiz.questions.length - 1}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Results Mode
  if (showResults) {
    const score = selectedAnswers.reduce((acc, answer, index) => {
      return acc + (answer === quiz.questions[index].correctAnswer ? 1 : 0)
    }, 0)
    const percentage = Math.round((score / quiz.questions.length) * 100)
    const xpGained = calculateXP(score, quiz.questions.length, quiz.difficulty_level)

    return (
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Quiz Complete! 🎉</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-white" />
          </div>

          <h3 className="text-4xl font-bold mb-2 text-gray-800">{percentage}%</h3>
          <p className={`text-xl font-semibold mb-2 ${getScoreColor(score, quiz.questions.length)}`}>
            {score} out of {quiz.questions.length} correct
          </p>
          <p className="text-lg text-gray-600 mb-6">{getScoreMessage(score, quiz.questions.length)}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Time Spent</p>
              <p className="font-bold text-blue-600">{formatTime(timeSpent)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <Star className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">XP Earned</p>
              <p className="font-bold text-purple-600">{xpGained}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <Trophy className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="font-bold text-green-600">{percentage}%</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={() => setShowReview(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Review Answers
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-left bg-gray-50 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-4">Quick Summary:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600 font-medium">✓ Correct: {score}</span>
              </div>
              <div>
                <span className="text-red-600 font-medium">✗ Incorrect: {quiz.questions.length - score}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">⏱ Time: {formatTime(timeSpent)}</span>
              </div>
              <div>
                <span className="text-purple-600 font-medium">⭐ XP: +{xpGained}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Quiz Mode
  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">{quiz.difficulty_level}</Badge>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeSpent)}</span>
            </div>
            <span>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Exit
            </Button>
          </div>
        </div>

        <Progress value={progress} className="h-3 mb-4" />

        <CardTitle className="text-xl font-bold text-gray-800">{question.question}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
              selectedAnswers[currentQuestion] === index
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-purple-300 hover:bg-purple-25"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswers[currentQuestion] === index ? "border-purple-500 bg-purple-500" : "border-gray-300"
                }`}
              >
                {selectedAnswers[currentQuestion] === index && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
              <span>{option}</span>
            </div>
          </button>
        ))}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={previousQuestion} disabled={currentQuestion === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={nextQuestion}
            disabled={selectedAnswers[currentQuestion] === undefined || isSubmitting}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : currentQuestion === quiz.questions.length - 1 ? (
              "Finish Quiz"
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
