"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Crown } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import GradientText from "@/components/ui/GradientText"
import { useRouter } from "next/navigation"
import { AnimatedCompetitionButton } from "@/components/ui/AnimatedCompetitionButton"

interface LeaderboardUser {
  user_id: string
  username: string
  avatar_url?: string
  total_xp: number;
  rank_position: number
}

interface LeaderboardProps {
  limit?: number
  showCurrentUser?: boolean
  variant?: string
}

export function Leaderboard({ limit = 10, showCurrentUser, variant }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const supabase = createClient()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("leaderboards")
        .select("user_id, username, avatar_url, total_xp, rank_position")
        .order("rank_position", { ascending: true })
        .limit(limit)

      if (error) {
        console.error("Error fetching leaderboard:", error)
        return
      }

      setLeaderboard(data || [])
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const topThree = leaderboard.slice(0, 3)
  const restOfLeaderboard = leaderboard.slice(3)

  const podiumVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        type: "spring",
        stiffness: 100,
      },
    }),
  }

  const listVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
      },
    }),
  }
  
  const getPodiumClass = (rank: number) => {
    switch (rank) {
      case 1: return "h-48 md:h-56 -mt-8 z-10";
      case 2: return "h-40 md:h-48";
      case 3: return "h-40 md:h-48";
      default: return "";
    }
  }

  const getPodiumColor = (rank: number) => {
    switch(rank) {
      case 1: return "from-yellow-400 to-amber-500";
      case 2: return "from-gray-300 to-gray-400";
      case 3: return "from-amber-600 to-orange-700";
      default: return "from-purple-500 to-pink-500";
    }
  }

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-pink-950/20 relative overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GradientText
            colors={["#ffaa40", "#9c40ff", "#ffaa40"]}
            className="text-4xl md:text-5xl font-bold"
          >
            Top Performers
          </GradientText>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
            See who's leading the pack and climbing the ranks!
          </p>
        </motion.div>
        
        {/* Podium for Top 3 */}
        <div className="flex justify-center items-end gap-4 md:gap-8 mb-16">
          {topThree.map((user, index) => (
            <motion.div
              key={user.user_id}
              className={`w-1/3 md:w-1/4 flex flex-col items-center relative ${getPodiumClass(user.rank_position)}`}
              custom={index}
              variants={podiumVariants}
              initial="hidden"
              animate="visible"
            >
              <div className={`absolute -top-6 ${user.rank_position === 1 ? 'text-yellow-400' : 'text-gray-400'}`}>
                <Crown size={user.rank_position === 1 ? 48 : 36} />
              </div>
              <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-white dark:border-gray-800 shadow-lg">
                <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className={`bg-gradient-to-br ${getPodiumColor(user.rank_position)} text-white`}>
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 text-center">
                <p className="font-bold text-lg">{user.username}</p>
                <p className="text-muted-foreground text-sm">{user.total_xp} XP</p>
              </div>
              <div className={`w-full h-16 rounded-t-lg mt-4 bg-gradient-to-b ${getPodiumColor(user.rank_position)} flex items-center justify-center text-white text-3xl font-bold`}>
                {user.rank_position}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Rest of the Leaderboard */}
        <div className="space-y-4">
          {restOfLeaderboard.map((user, index) => (
            <motion.div
              key={user.user_id}
              custom={index}
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="group"
            >
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out opacity-50 dark:via-white/10" />
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="font-bold text-lg w-8 text-center text-muted-foreground">
                    {user.rank_position}
                  </div>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{user.username}</p>
                  </div>
                  <div className="font-bold text-lg text-purple-500">
                    {user.total_xp} <span className="text-sm text-muted-foreground">XP</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex justify-center mt-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <AnimatedCompetitionButton />
        </motion.div>
      </div>
    </section>
  )
}
