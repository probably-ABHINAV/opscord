"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, GitPullRequest, MessageSquare, Settings, Zap, ChevronRight } from "lucide-react"
import { useState } from "react"

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/repositories",
    label: "Repositories",
    icon: GitPullRequest,
  },
  {
    href: "/dashboard/integrations",
    label: "Integrations",
    icon: MessageSquare,
  },
  {
    href: "/dashboard/jobs",
    label: "Job Queue",
    icon: Zap,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <aside className="hidden w-64 border-r border-sidebar-border bg-sidebar md:block sticky top-0 h-screen overflow-y-auto">
      <div className="p-6 sticky top-0">
        <h2 className="text-lg font-bold gradient-text">DevSync</h2>
      </div>
      <nav className="space-y-1 px-3 pb-6">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-sidebar-primary/80 to-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4 transition-all duration-200", hoveredItem === item.href && "scale-110")} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="h-4 w-4 animate-pulse" />}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
