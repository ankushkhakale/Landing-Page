-- Create or replace the function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type, age)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'student'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'age' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'age')::INTEGER 
      ELSE NULL 
    END
  );
  
  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
  current_level INTEGER;
BEGIN
  -- Get current XP and level
  SELECT xp_points, level INTO current_xp, current_level
  FROM user_progress 
  WHERE user_progress.user_id = update_user_progress.user_id;
  
  -- If no record exists, create one
  IF current_xp IS NULL THEN
    INSERT INTO user_progress (user_id, xp_points, level)
    VALUES (update_user_progress.user_id, xp_to_add, 1);
    RETURN;
  END IF;
  
  -- Calculate new level
  new_level := FLOOR((current_xp + xp_to_add) / 100) + 1;
  
  -- Update user progress
  UPDATE user_progress 
  SET 
    xp_points = xp_points + xp_to_add,
    level = GREATEST(new_level, current_level),
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
