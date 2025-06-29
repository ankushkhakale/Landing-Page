# BrainBuddy Setup Guide

## Step 1: Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Get your credentials** from Settings > API:
   - Project URL
   - Anon/public key

## Step 2: Environment Variables

Create a `.env.local` file in your project root:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
GEMINI_API_KEY=your_gemini_api_key_here
\`\`\`

## Step 3: Database Setup

Run these SQL scripts **in order** in your Supabase SQL Editor:

### 3.1 Create Tables
\`\`\`sql
-- Copy and paste the contents of scripts/setup-database-clean.sql
\`\`\`

### 3.2 Setup Policies
\`\`\`sql
-- Copy and paste the contents of scripts/setup-policies.sql
\`\`\`

### 3.3 Setup Functions
\`\`\`sql
-- Copy and paste the contents of scripts/setup-functions.sql
\`\`\`

### 3.4 Setup Storage
\`\`\`sql
-- Copy and paste the contents of scripts/setup-storage.sql
\`\`\`

## Step 4: Authentication Settings

1. Go to **Authentication > Settings** in Supabase
2. **Disable email confirmations** for development:
   - Uncheck "Enable email confirmations"
3. **Add your site URL**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

## Step 5: Install Dependencies

\`\`\`bash
npm install
\`\`\`

## Step 6: Start Development Server

\`\`\`bash
npm run dev
\`\`\`

## Troubleshooting

### Common Issues:

1. **"Permission denied" errors**: 
   - Make sure you're running SQL as the project owner
   - Try running each script section separately

2. **"Policy already exists" errors**:
   - The scripts now handle this automatically
   - If you still get errors, manually drop policies first

3. **File upload errors**:
   - Check that storage policies are set up correctly
   - Verify your Supabase URL and keys

4. **AI features not working**:
   - Verify your Gemini API key is correct
   - AI features require a valid Gemini API key to function

### Getting a Gemini API Key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

## Features Overview

- ✅ **File Upload**: Drag & drop with progress tracking
- ✅ **AI Quiz Generation**: Powered by Gemini AI
- ✅ **Interactive Chat**: Real-time AI conversation
- ✅ **Achievement System**: Gamified learning progress
- ✅ **Progress Tracking**: XP, levels, and streaks
- ✅ **Responsive Design**: Works on all devices

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure all SQL scripts ran successfully
4. Check Supabase logs for database errors
