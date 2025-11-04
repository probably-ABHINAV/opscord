import { getUserStats, getLeaderboardTop } from "@/lib/gamification"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userStats = await getUserStats(session.user.id)
    const leaderboard = await getLeaderboardTop(10)

    return NextResponse.json({
      userStats,
      leaderboard,
    })
  } catch (error) {
    console.error("[v0] Gamification stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
