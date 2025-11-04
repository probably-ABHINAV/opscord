import { getQueueStats } from "@/lib/queue"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await getQueueStats(userData.user.id)

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Queue Stats] Error:", error)
    return NextResponse.json({ error: "Failed to get queue statistics" }, { status: 500 })
  }
}
