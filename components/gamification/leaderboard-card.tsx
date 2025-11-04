"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface LeaderboardEntry {
  userId: string
  rank: number
  xpTotal: number
  prCount: number
  reviewCount: number
}

interface LeaderboardCardProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

export function LeaderboardCard({ entries, currentUserId }: LeaderboardCardProps) {
  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>Top contributors by XP</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                entry.userId === currentUserId ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted-foreground w-6">#{entry.rank}</span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{entry.userId.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{entry.userId}</p>
                  <p className="text-xs text-muted-foreground">{entry.prCount} PRs</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-primary/10">
                {entry.xpTotal} XP
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
