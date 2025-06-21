# Database Setup Guide

## Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

## Step 2: Get Your Credentials
1. Go to Settings > API
2. Copy your Project URL
3. Copy your anon/public key

## Step 3: Set Environment Variables
Create a `.env.local` file in your project root:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
\`\`\`

## Step 4: Run Database Setup
1. Go to your Supabase dashboard
2. Click on "SQL Editor"
3. Copy and paste the contents of `scripts/setup-database-fixed.sql`
4. Click "Run"

## Step 5: Enable Authentication
1. Go to Authentication > Settings
2. Make sure "Enable email confirmations" is turned OFF for development
3. Add your site URL (http://localhost:3000) to "Site URL"

## Troubleshooting

### If you get permission errors:
- Make sure you're running the SQL as the project owner
- Try running each section of the SQL separately
- Check that RLS is properly enabled

### If authentication isn't working:
- Verify your environment variables are correct
- Check that your site URL is added to Supabase settings
- Make sure email confirmation is disabled for development

### If you see multiple client instances:
- This should be fixed with the new singleton pattern
- Clear your browser cache and restart the dev server
