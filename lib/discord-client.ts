import { Client, GatewayIntentBits, REST, Routes } from "discord.js"
import { prisma } from "@/lib/prisma"

let discordClient: Client | null = null

export async function initDiscordClient() {
  if (discordClient) return discordClient

  const token = process.env.DISCORD_TOKEN
  if (!token) throw new Error("DISCORD_TOKEN is not set")

  discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
  })

  discordClient.once("ready", () => {
    console.log(`[v0] Discord bot logged in as ${discordClient?.user?.tag}`)
  })

  discordClient.on("interactionCreate", handleInteraction)

  await discordClient.login(token)
  return discordClient
}

export async function handleInteraction(interaction: any) {
  if (interaction.isChatInputCommand()) {
    const command = interaction.commandName

    try {
      switch (command) {
        case "create-issue":
          await handleCreateIssue(interaction)
          break
        case "merge-pr":
          await handleMergePR(interaction)
          break
        case "deploy":
          await handleDeploy(interaction)
          break
        case "summarize":
          await handleSummarize(interaction)
          break
        case "leaderboard":
          await handleLeaderboard(interaction)
          break
        case "ping":
          await interaction.reply("Pong! System is online.")
          break
        default:
          await interaction.reply("Unknown command")
      }
    } catch (error) {
      console.error("[v0] Command error:", error)
      await interaction.reply({ content: "An error occurred", ephemeral: true })
    }
  }
}

async function handleCreateIssue(interaction: any) {
  const title = interaction.options.getString("title")
  const description = interaction.options.getString("description")
  const labels = interaction.options.getString("labels")?.split(",") || []

  await interaction.deferReply()

  const repo = await prisma.repo.findFirst({
    where: { isActive: true },
  })

  if (!repo) {
    await interaction.editReply("No active repository configured")
    return
  }

  // Create job to create issue via GitHub API
  await prisma.job.create({
    data: {
      type: "CREATE_ISSUE",
      status: "pending",
      data: {
        repoId: repo.id,
        title,
        description,
        labels,
        discordUserId: interaction.user.id,
      },
    },
  })

  await interaction.editReply("Issue creation queued!")
}

async function handleMergePR(interaction: any) {
  const prNumber = interaction.options.getInteger("pr-number")

  await interaction.deferReply()

  const repo = await prisma.repo.findFirst({
    where: { isActive: true },
  })

  if (!repo) {
    await interaction.editReply("No active repository configured")
    return
  }

  await prisma.job.create({
    data: {
      type: "MERGE_PR",
      status: "pending",
      data: {
        repoId: repo.id,
        prNumber,
        discordUserId: interaction.user.id,
      },
    },
  })

  await interaction.editReply("Merge queued! Awaiting approval.")
}

async function handleDeploy(interaction: any) {
  const branch = interaction.options.getString("branch") || "main"

  await interaction.deferReply()

  await prisma.job.create({
    data: {
      type: "DEPLOY",
      status: "pending",
      data: {
        branch,
        discordUserId: interaction.user.id,
      },
    },
  })

  await interaction.editReply(`Deployment from \`${branch}\` branch initiated!`)
}

async function handleSummarize(interaction: any) {
  const days = interaction.options.getInteger("days") || 7

  await interaction.deferReply()

  const prs = await prisma.pullRequest.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      },
    },
    take: 50,
  })

  const summary = `In the last ${days} days: ${prs.length} PRs merged. ${prs.filter((p) => p.aiSummary).length} had AI summaries generated.`

  await interaction.editReply(summary)
}

async function handleLeaderboard(interaction: any) {
  await interaction.deferReply()

  const leaderboard = await prisma.leaderboard.findMany({
    orderBy: { xpTotal: "desc" },
    take: 10,
  })

  let embed = "**Top Contributors**\n```"
  leaderboard.forEach((entry, index) => {
    embed += `${index + 1}. ${entry.userId} - ${entry.xpTotal} XP\n`
  })
  embed += "```"

  await interaction.editReply(embed)
}

export async function registerSlashCommands() {
  const clientId = process.env.DISCORD_CLIENT_ID
  const token = process.env.DISCORD_TOKEN

  if (!clientId || !token) throw new Error("Missing Discord credentials")

  const rest = new REST({ version: "10" }).setToken(token)

  const commands = [
    {
      name: "create-issue",
      description: "Create a new GitHub issue from Discord",
      options: [
        { name: "title", type: 3, description: "Issue title", required: true },
        {
          name: "description",
          type: 3,
          description: "Issue description",
          required: true,
        },
        { name: "labels", type: 3, description: "Comma-separated labels" },
      ],
    },
    {
      name: "merge-pr",
      description: "Merge a GitHub PR",
      options: [{ name: "pr-number", type: 4, description: "PR number", required: true }],
    },
    {
      name: "deploy",
      description: "Trigger a deployment",
      options: [{ name: "branch", type: 3, description: "Branch to deploy" }],
    },
    {
      name: "summarize",
      description: "Get AI summary of recent activity",
      options: [{ name: "days", type: 4, description: "Days to summarize" }],
    },
    {
      name: "leaderboard",
      description: "View contributor leaderboard",
    },
    {
      name: "ping",
      description: "Check bot status",
    },
  ]

  try {
    await rest.put(Routes.applicationCommands(clientId), { body: commands })
    console.log("[v0] Registered slash commands")
  } catch (error) {
    console.error("[v0] Failed to register commands:", error)
  }
}

export async function sendDiscordMessage(channelId: string, message: string, embeds?: any[]) {
  const client = await initDiscordClient()
  const channel = await client.channels.fetch(channelId)

  if (!channel || !channel.isTextBased()) {
    throw new Error("Invalid channel")
  }

  return await channel.send({
    content: message,
    embeds: embeds || [],
  })
}

export async function sendDiscordEmbed(channelId: string, embed: any) {
  return sendDiscordMessage(channelId, "", [embed])
}
