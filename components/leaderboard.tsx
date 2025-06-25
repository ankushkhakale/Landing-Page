"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Crown, Medal, Flame, Zap, Star } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"

interface LeaderboardUser {
  id: string
  username: string
  avatar_url?: string
  total_xp: number
  current_level: number
  streak_days: number
  quizzes_completed: number
  rank_position: number
}

interface LeaderboardProps {
  limit?: number
  showCurrentUser?: boolean
  variant?: "full" | "compact"
}

export function Leaderboard({ limit = 10, showCurrentUser = true, variant = "full" }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    fetchLeaderboard()
  }, [limit])

  const fetchLeaderboard = async () => {
    try {
      // Fetch top users
      const { data: topUsers, error: topError } = await supabase
        .from("leaderboards")
        .select("*")
        .order("rank_position", { ascending: true })
        .limit(limit)

      if (topError) {
        console.error("Error fetching leaderboard:", topError)
        return
      }

      setLeaderboard(topUsers || [])

      // Fetch current user's rank if not in top list
      if (user && showCurrentUser) {
        const { data: userRank, error: userError } = await supabase
          .from("leaderboards")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (!userError && userRank) {
          setCurrentUserRank(userRank)
        }
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">
            #{position}
          </span>
        )
    }
  }

  const getRankBadgeColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Top Performers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === "compact") {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>Top Performers</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {leaderboard.slice(0, 3).map((user) => (
            <Card key={user.id} className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">{getRankIcon(user.rank_position)}</div>
                <Avatar className="w-12 h-12 mx-auto mb-2">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-sm">{user.username}</p>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    {user.total_xp}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    L{user.current_level}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {leaderboard.map((user) => (
          <div
            key={user.id}
            className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
              user.rank_position <= 3
                ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20"
                : "hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center space-x-3">
              {getRankIcon(user.rank_position)}
              <Badge className={`px-2 py-1 text-xs ${getRankBadgeColor(user.rank_position)}`}>
                #{user.rank_position}
              </Badge>
            </div>

            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{user.username}</p>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-purple-500" />
                  <span className="text-xs text-muted-foreground">{user.total_xp} XP</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Level {user.current_level}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-muted-foreground">{user.streak_days} days</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user.quizzes_completed}</p>
              <p className="text-xs text-muted-foreground">quizzes</p>
            </div>
          </div>
        ))}

        {/* Current user rank if not in top list */}
        {currentUserRank && !leaderboard.find((u) => u.id === currentUserRank.id) && (
          <>
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-2">Your Rank:</p>
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-blue-600">
                    #{currentUserRank.rank_position}
                  </span>
                </div>

                <Avatar className="w-10 h-10">
                  <AvatarImage src={currentUserRank.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {currentUserRank.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{currentUserRank.username} (You)</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-purple-500" />
                      <span className="text-xs text-muted-foreground">{currentUserRank.total_xp} XP</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Level {currentUserRank.current_level}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span className="text-xs text-muted-foreground">{currentUserRank.streak_days} days</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{currentUserRank.quizzes_completed}</p>
                  <p className="text-xs text-muted-foreground">quizzes</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}