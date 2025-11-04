"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal } from "lucide-react"

interface LeaderboardEntry {
  userId: string
  rank: number
  xpTotal: number
  prCount: number
  reviewCount: number
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/gamification/stats")
        if (response.ok) {
          const data = await response.json()
          setEntries(data.leaderboard || [])
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />
    return null
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Leaderboard</h1>
        <p className="text-muted-foreground">Top contributors by XP</p>
      </div>

      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
          <CardDescription>Based on accumulated XP from PRs, reviews, and contributions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No leaderboard data yet. Start contributing!</div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-secondary/5 transition-colors border border-border/50 hover:border-primary/30"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getMedalIcon(entry.rank) && <div className="flex-shrink-0">{getMedalIcon(entry.rank)}</div>}
                    {!getMedalIcon(entry.rank) && (
                      <span className="text-sm font-bold text-muted-foreground w-8">#{entry.rank}</span>
                    )}
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{entry.userId.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{entry.userId}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.prCount} PRs • {entry.reviewCount} reviews
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-primary/10 font-bold">
                      {entry.xpTotal} XP
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
