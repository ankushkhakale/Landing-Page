-- Add leaderboard and notifications tables
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  rank_position INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'success', 'warning', 'error', 'info', 'achievement'
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'quiz_completed', 'file_uploaded', 'streak_maintained', 'level_up'
  activity_date DATE DEFAULT CURRENT_DATE,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON leaderboards(rank_position);
CREATE INDEX IF NOT EXISTS idx_leaderboards_xp ON leaderboards(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_activities_date ON user_activities(user_id, activity_date);

-- Function to update leaderboard rankings
CREATE OR REPLACE FUNCTION update_leaderboard_rankings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update rankings based on total XP, then level, then streak
  WITH ranked_users AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        ORDER BY total_xp DESC, current_level DESC, streak_days DESC, last_updated ASC
      ) as new_rank
    FROM leaderboards
  )
  UPDATE leaderboards 
  SET rank_position = ranked_users.new_rank,
      last_updated = NOW()
  FROM ranked_users 
  WHERE leaderboards.id = ranked_users.id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update rankings
CREATE OR REPLACE TRIGGER trigger_update_rankings
  AFTER INSERT OR UPDATE OF total_xp, current_level, streak_days ON leaderboards
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_leaderboard_rankings();

-- Function to check and update streak
CREATE OR REPLACE FUNCTION check_and_update_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  last_activity_date DATE;
  current_streak INTEGER;
  today_activity_count INTEGER;
BEGIN
  -- Get current streak and last activity
  SELECT streak_days INTO current_streak
  FROM user_progress 
  WHERE user_id = p_user_id;
  
  -- Check if user has activity today
  SELECT COUNT(*) INTO today_activity_count
  FROM user_activities
  WHERE user_id = p_user_id 
  AND activity_date = CURRENT_DATE;
  
  -- Get last activity date
  SELECT MAX(activity_date) INTO last_activity_date
  FROM user_activities
  WHERE user_id = p_user_id 
  AND activity_date < CURRENT_DATE;
  
  -- Update streak logic
  IF today_activity_count > 0 THEN
    -- User has activity today
    IF last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN
      -- Consecutive day - increment streak
      current_streak := current_streak + 1;
    ELSIF last_activity_date IS NULL OR last_activity_date < CURRENT_DATE - INTERVAL '1 day' THEN
      -- First day or broken streak - reset to 1
      current_streak := 1;
    END IF;
    
    -- Update user progress
    UPDATE user_progress 
    SET streak_days = current_streak,
        last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    
    -- Update leaderboard
    UPDATE leaderboards 
    SET streak_days = current_streak
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view leaderboards" ON leaderboards FOR SELECT USING (true);
CREATE POLICY "Users can update own leaderboard" ON leaderboards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leaderboard" ON leaderboards FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activities" ON user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow users to upsert (insert/update/select) their own leaderboard row
CREATE POLICY "Users can upsert own leaderboard"
ON leaderboards
FOR ALL
USING (auth.uid() = user_id);

-- Allow users to insert notifications for themselves
CREATE POLICY "Users can insert own notifications"
ON notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own notifications (optional, but recommended)
CREATE POLICY "Users can view own notifications"
ON notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Allow public read access to avatars
create policy "Public read" on storage.objects
for select
using (bucket_id = 'avatars');

-- Allow authenticated users to upload files to the avatars bucket
create policy "Authenticated users can upload avatars"
on storage.objects
for insert
with check (
  bucket_id = 'avatars' AND auth.role() = 'authenticated'
);
