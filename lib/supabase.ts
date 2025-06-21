import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a singleton instance to avoid multiple clients
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return supabaseInstance
})()

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          user_type: "student" | "teacher" | "parent" | "admin"
          age: number | null
          grade_level: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          user_type?: "student" | "teacher" | "parent" | "admin"
          age?: number | null
          grade_level?: string | null
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          user_type?: "student" | "teacher" | "parent" | "admin"
          age?: number | null
          grade_level?: string | null
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          xp_points: number
          level: number
          streak_days: number
          last_activity_date: string
          total_quizzes_completed: number
          total_study_time_minutes: number
          created_at: string
          updated_at: string
        }
      }
      uploaded_files: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_type: string
          file_size: number
          file_url: string
          upload_date: string
          processing_status: "pending" | "processing" | "completed" | "failed"
        }
      }
    }
  }
}
