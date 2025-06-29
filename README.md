# BrainBuddy - AI-Powered Learning Platform for Kids

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/neongenesisdevs-7042s-projects/v0-brain-buddy-landing-page)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 🧠 Overview

BrainBuddy is an innovative AI-powered learning platform designed specifically for students under 15. It transforms traditional study sessions into exciting, gamified learning adventures using cutting-edge AI technology.

### ✨ Key Features

- **🤖 AI-Powered Content Generation**: Automatically creates quizzes, summaries, and study materials from uploaded documents
- **🎮 Gamified Learning**: XP system, levels, achievements, and leaderboards to keep students engaged
- **💬 Interactive AI Chat**: Real-time conversation with an AI tutor for personalized learning support
- **📊 Progress Tracking**: Comprehensive analytics and progress visualization
- **🏆 Achievement System**: Unlock badges and rewards for learning milestones
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🌙 Dark/Light Mode**: Beautiful theme switching for comfortable learning

## 🚀 Live Demo

**[View Live Demo](https://vercel.com/neongenesisdevs-7042s-projects/v0-brain-buddy-landing-page)**

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Supabase (Database, Authentication, Storage)
- **AI Integration**: Google Gemini AI
- **Deployment**: Vercel
- **State Management**: React Context API
- **Animations**: Framer Motion

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/brainbuddy.git
cd brainbuddy
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Database Setup

1. Create a [Supabase](https://supabase.com) project
2. Run the database setup scripts in order:
   - `scripts/setup-database-clean.sql`
   - `scripts/setup-policies.sql`
   - `scripts/setup-functions.sql`
   - `scripts/setup-storage.sql`

### 5. Start Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📚 Detailed Setup Guide

For comprehensive setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 🏗️ Project Structure

```
brainbuddy/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard page
│   ├── login/            # Authentication pages
│   └── signup/           # Registration page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature-specific components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── scripts/              # Database setup scripts
└── public/               # Static assets
```

## 🎯 Core Features

### AI-Powered Learning
- **Document Processing**: Upload PDFs, images, or text files
- **Quiz Generation**: AI creates interactive quizzes from content
- **Summary Creation**: Automatic content summarization
- **Smart Chat**: Context-aware AI tutoring

### Gamification System
- **XP Points**: Earn experience for completing activities
- **Level Progression**: Level up based on XP earned
- **Achievement Badges**: Unlock rewards for milestones
- **Streak Tracking**: Maintain daily learning streaks
- **Leaderboards**: Compete with other students

### Progress Analytics
- **Learning Dashboard**: Visual progress overview
- **Performance Metrics**: Detailed analytics and insights
- **Study Time Tracking**: Monitor learning sessions
- **Quiz History**: Review past performance

## 🔧 API Endpoints

- `POST /api/chat` - AI chat functionality
- `POST /api/extract-text` - Document text extraction
- `POST /api/generate-quiz` - AI quiz generation
- `POST /api/generate-summary` - Content summarization
- `POST /api/generate-quote` - Quote generation

## 🎨 Customization

### Themes
The application supports both light and dark themes with automatic system preference detection.

### Styling
Built with Tailwind CSS for easy customization. Component styles can be modified in the respective component files.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for common solutions
2. Review the browser console for error messages
3. Verify all environment variables are correctly set
4. Ensure database setup scripts have been executed successfully

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com) for backend services
- [Google Gemini AI](https://ai.google.dev/) for AI capabilities
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository


hello making 
**Made with ❤️ for the future of education**
