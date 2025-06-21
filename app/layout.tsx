import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"

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
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
