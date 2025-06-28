import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { quest_id } = await request.json()

  // Get user session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user_id = user.id
  const today = new Date().toISOString().slice(0, 10)

  // Insert quest completion
  const { error: insertError } = await supabase.from("user_quest_completions").insert({
    user_id,
    quest_id,
    completed_at: new Date().toISOString(),
    completed_date: today,
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  // Get user's current streak
  const { data: streakData } = await supabase
    .from("user_streaks")
    .select("current_streak, last_completed_at")
    .eq("user_id", user_id)
    .single()

  let newStreak = 1
  let updateObj = { current_streak: 1, last_completed_at: today }

  if (streakData) {
    const lastDate = streakData.last_completed_at
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    if (lastDate === yesterday) {
      newStreak = streakData.current_streak + 1
    } else if (lastDate === today) {
      newStreak = streakData.current_streak // already completed today
    } else {
      newStreak = 1 // streak reset
    }
    updateObj = { current_streak: newStreak, last_completed_at: today }
    await supabase.from("user_streaks").upsert({ user_id, ...updateObj })
  } else {
    await supabase.from("user_streaks").insert({ user_id, ...updateObj })
  }

  return NextResponse.json({ success: true, newStreak })
} 