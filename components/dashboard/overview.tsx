"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GitBranch, MessageSquare, Zap, ArrowUpRight, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Stats {
  repos: number
  discordServers: number
  queuedJobs: number
  completedJobs: number
  xp: number
  rank: number
}

export function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    repos: 0,
    discordServers: 0,
    queuedJobs: 0,
    completedJobs: 0,
    xp: 0,
    rank: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/gamification/stats")
        if (response.ok) {
          const data = await response.json()
          setStats({
            repos: 0,
            discordServers: 0,
            queuedJobs: 0,
            completedJobs: 0,
            xp: data.userStats?.xp || 0,
            rank: data.userStats?.rank || 0,
          })
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statItems = [
    {
      label: "Connected Repos",
      value: stats.repos,
      icon: GitBranch,
      color: "text-blue-500",
      gradient: "from-blue-500/20 to-blue-500/5",
    },
    {
      label: "Discord Servers",
      value: stats.discordServers,
      icon: MessageSquare,
      color: "text-purple-500",
      gradient: "from-purple-500/20 to-purple-500/5",
    },
    {
      label: "Your XP",
      value: stats.xp,
      icon: Zap,
      color: "text-yellow-500",
      gradient: "from-yellow-500/20 to-yellow-500/5",
    },
    {
      label: "Leaderboard Rank",
      value: `#${stats.rank}`,
      icon: Trophy,
      color: "text-green-500",
      gradient: "from-green-500/20 to-green-500/5",
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-balance">Welcome back!</h1>
        <p className="text-muted-foreground">Here's what's happening with your DevSync integrations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item, index) => {
          const Icon = item.icon
          return (
            <Card
              key={item.label}
              className={cn(
                "card-hover glass relative overflow-hidden border-primary/20",
                "animate-in fade-in slide-in-from-bottom-4 duration-500",
              )}
              style={{ animationDelay: `${index * 100}ms` } as any}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} pointer-events-none`}></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground/80">{item.label}</CardTitle>
                <div className={`rounded-lg p-2.5 bg-white/10 dark:bg-black/20 ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold">
                  {loading ? <span className="animate-pulse">—</span> : item.value}
                </div>
                <p className="text-xs text-muted-foreground/60 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  Updated live
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Getting Started */}
      <Card className="card-hover glass border-primary/20 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {[
              { step: 1, title: "Connect GitHub", desc: "Link your organization and select repos" },
              { step: 2, title: "Setup Discord", desc: "Choose channels for notifications" },
              { step: 3, title: "Configure AI", desc: "Enable PR summarization" },
              { step: 4, title: "Test & Deploy", desc: "Run your first integration" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex gap-4 p-3 rounded-lg bg-white/5 dark:bg-black/20 hover:bg-white/10 dark:hover:bg-black/30 transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary text-white text-sm font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 glow-button">
            Start Setup →
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
