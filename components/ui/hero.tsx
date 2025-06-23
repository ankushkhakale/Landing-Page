"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface HeroAction {
  label: string
  href: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  onClick?: () => void
}

interface HeroProps extends React.HTMLAttributes<HTMLElement> {
  gradient?: boolean
  heading?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: HeroAction[]
  headingClassName?: string
  subtitleClassName?: string
  actionsClassName?: string
}

const Hero = React.forwardRef<HTMLElement, HeroProps>(
  (
    {
      className,
      gradient = true,
      heading,
      subtitle,
      actions,
      headingClassName,
      subtitleClassName,
      actionsClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative z-0 flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-background",
          className,
        )}
        {...props}
      >
        {gradient && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950 dark:via-blue-950 dark:to-pink-950 opacity-50" />
        )}

        <div className="relative z-50 container flex justify-center flex-1 flex-col px-5 md:px-10 gap-4 -translate-y-20">
          <div className="flex flex-col items-center text-center space-y-6">
            <h1 className={cn("text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight", headingClassName)}>
              {heading}
            </h1>
            {subtitle && <p className={cn("text-xl text-muted-foreground max-w-3xl", subtitleClassName)}>{subtitle}</p>}
            {actions && actions.length > 0 && (
              <div className={cn("flex flex-col sm:flex-row gap-4", actionsClassName)}>
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    size="lg"
                    className="px-8 py-4 text-lg"
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    )
  },
)
Hero.displayName = "Hero"

export { Hero }
