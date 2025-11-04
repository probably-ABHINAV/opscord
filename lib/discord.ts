import { createClient } from "@/lib/supabase/server"

export interface DiscordMessage {
  content: string
  embeds?: Array<{
    title: string
    description: string
    color?: number
    fields?: Array<{
      name: string
      value: string
      inline?: boolean
    }>
    footer?: {
      text: string
    }
  }>
}

export async function sendDiscordMessage(
  channelId: string,
  message: DiscordMessage,
  botToken: string,
): Promise<string> {
  const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  })

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.id
}

export async function editDiscordMessage(
  channelId: string,
  messageId: string,
  message: DiscordMessage,
  botToken: string,
): Promise<void> {
  const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  })

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.statusText}`)
  }
}

export async function storeDiscordServer(userId: string, guildId: string, guildName: string, botToken: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("discord_servers")
    .insert({
      user_id: userId,
      guild_id: guildId,
      guild_name: guildName,
      bot_token: botToken,
    })
    .select("id")
    .single()

  if (error) throw error
  return data
}

export async function storeDiscordChannel(
  serverId: string,
  channelId: string,
  channelName: string,
  channelType: string,
  notificationType?: string,
  repoId?: string,
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("discord_channels")
    .insert({
      server_id: serverId,
      channel_id: channelId,
      channel_name: channelName,
      channel_type: channelType,
      notification_type: notificationType,
      repo_id: repoId || null,
    })
    .select("id")
    .single()

  if (error) throw error
  return data
}

export async function getDiscordChannelsForRepo(repoId: string, notificationType?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("discord_channels")
    .select(
      `
      id,
      channel_id,
      server_id,
      discord_servers(bot_token)
    `,
    )
    .eq("repo_id", repoId)

  if (notificationType) {
    query = query.eq("notification_type", notificationType)
  }

  const { data, error } = await query

  if (error) {
    console.error("[Discord] Query error:", error)
    return []
  }

  return data || []
}

export async function updatePRMessageId(prId: string, messageId: string, channelId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("github_pull_requests")
    .update({ discord_message_id: `${channelId}/${messageId}` })
    .eq("id", prId)

  if (error) {
    console.error("[Discord] Failed to update PR message ID:", error)
  }
}

export function formatPREmbed(prNumber: number, title: string, author: string, url: string, summary?: string) {
  return {
    title: `#${prNumber}: ${title}`,
    description: summary || "PR awaiting summarization...",
    color: 0x2f3136,
    fields: [
      {
        name: "Author",
        value: author,
        inline: true,
      },
      {
        name: "Status",
        value: "Open",
        inline: true,
      },
      {
        name: "View on GitHub",
        value: `[Open PR](${url})`,
        inline: false,
      },
    ],
    footer: {
      text: "DevSync - AI-powered DevOps Bot",
    },
  }
}

export function formatIssueEmbed(issueNumber: number, title: string, author: string, url: string, labels?: string[]) {
  return {
    title: `#${issueNumber}: ${title}`,
    color: 0x2f3136,
    fields: [
      {
        name: "Author",
        value: author,
        inline: true,
      },
      ...(labels && labels.length > 0
        ? [
            {
              name: "Labels",
              value: labels.join(", "),
              inline: true,
            },
          ]
        : []),
      {
        name: "View on GitHub",
        value: `[Open Issue](${url})`,
        inline: false,
      },
    ],
    footer: {
      text: "DevSync - AI-powered DevOps Bot",
    },
  }
}
