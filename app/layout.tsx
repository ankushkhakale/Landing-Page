import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { FirebaseAuthProvider } from "@/contexts/firebase-auth-context"
import { MoodProvider } from "@/contexts/mood-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BrainBuddy - Learn Like You Play | AI-Powered Learning for Kids",
  description:
    "BrainBuddy is a vibrant, AI-powered educational platform designed for children under 15. Transform boring study sessions into exciting adventures with personalized quizzes, interactive chatbot, and gamification.",
  keywords:
    "AI learning, kids education, personalized learning, educational games, study buddy, children learning platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className={inter.className}>
        <FirebaseAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <MoodProvider>
                {children}
              </MoodProvider>
            </AuthProvider>
          </ThemeProvider>
        </FirebaseAuthProvider>
      </body>
    </html>
  )
}
