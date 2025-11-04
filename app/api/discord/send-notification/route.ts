import {
  getDiscordChannelsForRepo,
  sendDiscordMessage,
  formatPREmbed,
  formatIssueEmbed,
  updatePRMessageId,
} from "@/lib/discord"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

interface NotificationRequest {
  repoId: string
  type: "pr" | "issue"
  prNumber?: number
  prTitle?: string
  prAuthor?: string
  prUrl?: string
  prSummary?: string
  issueNumber?: number
  issueTitle?: string
  issueAuthor?: string
  issueUrl?: string
  issueLabels?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: NotificationRequest = await request.json()

    // Get Discord channels for repo
    const channels = await getDiscordChannelsForRepo(body.repoId, body.type)

    if (channels.length === 0) {
      return NextResponse.json({ message: "No channels configured for notifications" }, { status: 200 })
    }

    let sentCount = 0

    for (const channel of channels) {
      try {
        const botToken = (channel.discord_servers as any)?.bot_token
        if (!botToken) continue

        const embed =
          body.type === "pr"
            ? formatPREmbed(body.prNumber!, body.prTitle!, body.prAuthor!, body.prUrl!, body.prSummary)
            : formatIssueEmbed(body.issueNumber!, body.issueTitle!, body.issueAuthor!, body.issueUrl!, body.issueLabels)

        const messageId = await sendDiscordMessage(
          channel.channel_id,
          {
            embeds: [embed],
          },
          botToken,
        )

        // Update PR with message ID if applicable
        if (body.type === "pr" && body.prNumber) {
          await updatePRMessageId(body.repoId, messageId, channel.channel_id)
        }

        sentCount++
      } catch (error) {
        console.error(`[Discord] Failed to send to channel:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      channelCount: channels.length,
      sentCount,
    })
  } catch (error) {
    console.error("[Discord Notification] Error:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
