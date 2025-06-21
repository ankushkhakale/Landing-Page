-- Enhanced function to update user progress with proper leveling
CREATE OR REPLACE FUNCTION update_user_progress(
  user_id UUID,
  xp_to_add INTEGER DEFAULT 0,
  quiz_completed BOOLEAN DEFAULT FALSE,
  study_time_minutes INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
  current_progress RECORD;
  new_xp INTEGER;
  new_level INTEGER;
  old_level INTEGER;
  level_up BOOLEAN := FALSE;
  streak_updated BOOLEAN := FALSE;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get current progress
  SELECT * INTO current_progress 
  FROM user_progress 
  WHERE user_progress.user_id = update_user_progress.user_id;
  
  -- If no record exists, create one
  IF current_progress IS NULL THEN
    INSERT INTO user_progress (user_id, xp_points, level, streak_days, last_activity_date)
    VALUES (update_user_progress.user_id, xp_to_add, 1, 1, today_date)
    RETURNING * INTO current_progress;
    
    RETURN json_build_object(
      'success', true,
      'level_up', true,
      'new_level', 1,
      'old_level', 0,
      'new_xp', xp_to_add,
      'streak_days', 1
    );
  END IF;
  
  -- Calculate new XP and level
  new_xp := current_progress.xp_points + xp_to_add;
  old_level := current_progress.level;
  
  -- Level calculation: Level 1 = 0-99 XP, Level 2 = 100-299 XP, Level 3 = 300-599 XP, etc.
  -- Formula: Level = floor(sqrt(xp/100)) + 1, but with minimum increments
  IF new_xp < 100 THEN
    new_level := 1;
  ELSIF new_xp < 300 THEN
    new_level := 2;
  ELSIF new_xp < 600 THEN
    new_level := 3;
  ELSIF new_xp < 1000 THEN
    new_level := 4;
  ELSIF new_xp < 1500 THEN
    new_level := 5;
  ELSIF new_xp < 2100 THEN
    new_level := 6;
  ELSIF new_xp < 2800 THEN
    new_level := 7;
  ELSIF new_xp < 3600 THEN
    new_level := 8;
  ELSIF new_xp < 4500 THEN
    new_level := 9;
  ELSE
    new_level := 10 + floor((new_xp - 4500) / 1000);
  END IF;
  
  level_up := new_level > old_level;
  
  -- Handle streak logic
  IF current_progress.last_activity_date = today_date THEN
    -- Same day, don't change streak
    streak_updated := FALSE;
  ELSIF current_progress.last_activity_date = today_date - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    UPDATE user_progress 
    SET streak_days = streak_days + 1,
        last_activity_date = today_date
    WHERE user_progress.user_id = update_user_progress.user_id;
    streak_updated := TRUE;
  ELSE
    -- Streak broken, reset to 1
    UPDATE user_progress 
    SET streak_days = 1,
        last_activity_date = today_date
    WHERE user_progress.user_id = update_user_progress.user_id;
    streak_updated := TRUE;
  END IF;
  
  -- Update main progress
  UPDATE user_progress 
  SET 
    xp_points = new_xp,
    level = new_level,
    total_quizzes_completed = CASE 
      WHEN quiz_completed THEN total_quizzes_completed + 1 
      ELSE total_quizzes_completed 
    END,
    total_study_time_minutes = total_study_time_minutes + study_time_minutes,
    updated_at = NOW()
  WHERE user_progress.user_id = update_user_progress.user_id;
  
  -- Get updated streak
  SELECT streak_days INTO current_progress.streak_days 
  FROM user_progress 
  WHERE user_progress.user_id = update_user_progress.user_id;
  
  RETURN json_build_object(
    'success', true,
    'level_up', level_up,
    'new_level', new_level,
    'old_level', old_level,
    'new_xp', new_xp,
    'streak_days', current_progress.streak_days,
    'streak_updated', streak_updated
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get XP required for next level
CREATE OR REPLACE FUNCTION get_xp_for_level(target_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  CASE target_level
    WHEN 1 THEN RETURN 0;
    WHEN 2 THEN RETURN 100;
    WHEN 3 THEN RETURN 300;
    WHEN 4 THEN RETURN 600;
    WHEN 5 THEN RETURN 1000;
    WHEN 6 THEN RETURN 1500;
    WHEN 7 THEN RETURN 2100;
    WHEN 8 THEN RETURN 2800;
    WHEN 9 THEN RETURN 3600;
    WHEN 10 THEN RETURN 4500;
    ELSE RETURN 4500 + (target_level - 10) * 1000;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Add subject progress table
CREATE TABLE IF NOT EXISTS public.subject_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  quizzes_completed INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject_name)
);

-- Enable RLS for subject progress
ALTER TABLE public.subject_progress ENABLE ROW LEVEL SECURITY;

-- Create policy for subject progress
CREATE POLICY "Users can manage own subject progress" ON public.subject_progress
  FOR ALL USING (auth.uid() = user_id);

-- Function to update subject progress
CREATE OR REPLACE FUNCTION update_subject_progress(
  user_id UUID,
  subject_name TEXT,
  quiz_score INTEGER,
  total_questions INTEGER
)
RETURNS void AS $$
DECLARE
  current_record RECORD;
  new_progress INTEGER;
BEGIN
  -- Get or create subject progress record
  SELECT * INTO current_record 
  FROM subject_progress 
  WHERE subject_progress.user_id = update_subject_progress.user_id 
  AND subject_progress.subject_name = update_subject_progress.subject_name;
  
  IF current_record IS NULL THEN
    -- Create new record
    new_progress := LEAST(100, (quiz_score * 100 / total_questions));
    INSERT INTO subject_progress (
      user_id, subject_name, progress_percentage, 
      quizzes_completed, total_questions_answered, correct_answers
    ) VALUES (
      update_subject_progress.user_id, 
      update_subject_progress.subject_name, 
      new_progress,
      1, 
      total_questions, 
      quiz_score
    );
  ELSE
    -- Update existing record
    new_progress := LEAST(100, 
      ((current_record.correct_answers + quiz_score) * 100) / 
      (current_record.total_questions_answered + total_questions)
    );
    
    UPDATE subject_progress 
    SET 
      progress_percentage = new_progress,
      quizzes_completed = quizzes_completed + 1,
      total_questions_answered = total_questions_answered + total_questions,
      correct_answers = correct_answers + quiz_score,
      last_activity = NOW(),
      updated_at = NOW()
    WHERE subject_progress.user_id = update_subject_progress.user_id 
    AND subject_progress.subject_name = update_subject_progress.subject_name;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
