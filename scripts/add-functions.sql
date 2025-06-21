-- Function to update user progress
CREATE OR REPLACE FUNCTION update_user_progress(
  user_id UUID,
  xp_to_add INTEGER DEFAULT 0,
  quiz_completed BOOLEAN DEFAULT FALSE
)
RETURNS void AS $$
DECLARE
  current_xp INTEGER;
  new_level INTEGER;
BEGIN
  -- Get current XP
  SELECT xp_points INTO current_xp 
  FROM user_progress 
  WHERE user_progress.user_id = update_user_progress.user_id;
  
  -- Calculate new level
  new_level := FLOOR((current_xp + xp_to_add) / 100) + 1;
  
  -- Update user progress
  UPDATE user_progress 
  SET 
    xp_points = xp_points + xp_to_add,
    level = new_level,
    total_quizzes_completed = CASE 
      WHEN quiz_completed THEN total_quizzes_completed + 1 
      ELSE total_quizzes_completed 
    END,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_progress.user_id = update_user_progress.user_id;
  
  -- Update streak
  UPDATE user_progress 
  SET streak_days = CASE 
    WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN streak_days + 1
    WHEN last_activity_date = CURRENT_DATE THEN streak_days
    ELSE 1
  END
  WHERE user_progress.user_id = update_user_progress.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
