-- Drop existing policies if they exist (to avoid conflicts)
DO $$ 
BEGIN
    -- Profiles policies
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    
    -- User progress policies
    DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
    DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_progress;
    
    -- Files policies
    DROP POLICY IF EXISTS "Users can view own files" ON public.uploaded_files;
    DROP POLICY IF EXISTS "Users can manage own files" ON public.uploaded_files;
    
    -- Quizzes policies
    DROP POLICY IF EXISTS "Users can view own quizzes" ON public.quizzes;
    DROP POLICY IF EXISTS "Users can manage own quizzes" ON public.quizzes;
    
    -- Quiz attempts policies
    DROP POLICY IF EXISTS "Users can view own quiz attempts" ON public.quiz_attempts;
    DROP POLICY IF EXISTS "Users can manage own quiz attempts" ON public.quiz_attempts;
    
    -- Achievements policies
    DROP POLICY IF EXISTS "Users can view own achievements" ON public.achievements;
    DROP POLICY IF EXISTS "Users can manage own achievements" ON public.achievements;
EXCEPTION
    WHEN undefined_object THEN
        NULL; -- Ignore if policies don't exist
END $$;

-- Create new policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own files" ON public.uploaded_files
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own quizzes" ON public.quizzes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own quiz attempts" ON public.quiz_attempts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own achievements" ON public.achievements
  FOR ALL USING (auth.uid() = user_id);
