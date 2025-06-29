"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TabItem {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface SidebarTabsProps {
  items: TabItem[]
  activeTab: string
  onTabChange: (key: string) => void
  className?: string
}

export function SidebarTabs({ items, activeTab, onTabChange, className }: SidebarTabsProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn("flex h-full w-64 flex-col bg-sidebar border-r border-border", className)}>
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.key
              
              return (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-12 px-3",
                        isActive && "bg-secondary text-secondary-foreground shadow-sm"
                      )}
                      onClick={() => onTabChange(item.key)}
                    >
                      <Icon className={cn(
                        "h-5 w-5",
                        isActive ? "text-secondary-foreground" : "text-muted-foreground"
                      )} />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="hidden lg:block">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </ScrollArea>
        
        <div className="p-3">
          <Separator className="mb-3" />
          <div className="text-xs text-muted-foreground text-center">
            BrainBuddy v1.0
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
} 