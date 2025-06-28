import React from "react";

interface SidebarTabItem {
  key: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarTabsProps {
  items: SidebarTabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function SidebarTabs({ items, activeTab, onTabChange }: SidebarTabsProps) {
  return (
    <aside className="w-56 min-h-screen flex flex-col items-center py-8 px-2 bg-white/80 dark:bg-[#20223a]/90 border-r border-border shadow-md rounded-tr-2xl rounded-br-2xl relative">
      <div className="w-full flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.key}
            className={`flex items-center gap-3 w-full px-5 py-3 rounded-xl font-medium text-base transition-colors duration-150
              ${activeTab === item.key
                ? "bg-purple-100 dark:bg-[#2d2250] text-purple-700 dark:text-purple-200 shadow"
                : "bg-transparent text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-[#23284a]"}
            `}
            onClick={() => onTabChange(item.key)}
          >
            <item.icon className="w-5 h-5 opacity-80" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      {/* Subtle vertical divider on the right edge */}
      <div className="absolute right-0 top-0 h-full w-px bg-border" />
    </aside>
  );
} 