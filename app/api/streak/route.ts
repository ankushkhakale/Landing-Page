import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = await createClient()

  // Get user session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user_id = user.id

  const { data, error } = await supabase
    .from("user_streaks")
    .select("current_streak, last_completed_at")
    .eq("user_id", user_id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json({ streak: data?.current_streak || 0, last_completed_at: data?.last_completed_at || null })
} 