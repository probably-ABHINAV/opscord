import { storeDiscordServer, storeDiscordChannel } from "@/lib/discord"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

interface ConnectRequest {
  guildId: string
  guildName: string
  botToken: string
  channels: Array<{
    id: string
    name: string
    type: string
    notificationType?: string
    repoId?: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: ConnectRequest = await request.json()
    const { guildId, guildName, botToken, channels } = body

    // Store Discord server
    const serverData = await storeDiscordServer(userData.user.id, guildId, guildName, botToken)

    // Store channels
    const channelIds = []
    for (const channel of channels) {
      const channelData = await storeDiscordChannel(
        serverData.id,
        channel.id,
        channel.name,
        channel.type,
        channel.notificationType,
        channel.repoId,
      )
      channelIds.push(channelData.id)
    }

    return NextResponse.json({
      success: true,
      serverId: serverData.id,
      channelIds,
    })
  } catch (error) {
    console.error("[Discord Connect] Error:", error)
    return NextResponse.json({ error: "Failed to connect Discord server" }, { status: 500 })
  }
}
