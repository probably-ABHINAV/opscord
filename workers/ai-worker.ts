import { prisma } from "@/lib/prisma"
import { generatePRSummary, categorizeIssue, generateDailySummary, generateRepositoryInsights } from "@/lib/ai-client"

export async function processAIJob(job: any) {
  try {
    switch (job.type) {
      case "SUMMARIZE_PR":
        await summarizePRJob(job)
        break
      case "CATEGORIZE_ISSUE":
        await categorizeIssueJob(job)
        break
      case "GENERATE_SUMMARY":
        await generateSummaryJob(job)
        break
      case "REPO_INSIGHTS":
        await repoInsightsJob(job)
        break
      default:
        console.log("[v0] Unknown AI job type:", job.type)
    }
  } catch (error) {
    console.error("[v0] AI worker error:", error)

    // Update job with error
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        retryCount: (job.retryCount || 0) + 1,
      },
    })

    throw error
  }
}

async function summarizePRJob(job: any) {
  const { prId, repoId, prNumber, owner, repoName } = job.data

  const pr = await prisma.pullRequest.findUnique({
    where: { id: prId },
  })

  if (!pr) throw new Error("PR not found")

  const summary = await generatePRSummary(pr.title, pr.body || "", pr.changes || 0, owner, repoName)

  // Store summary
  await prisma.pullRequest.update({
    where: { id: prId },
    data: { aiSummary: summary },
  })

  // Send to Discord
  const repo = await prisma.repo.findUnique({
    where: { id: repoId },
    include: { discord_channels: true },
  })

  if (repo) {
    const embed = {
      title: `PR #${prNumber}: ${pr.title}`,
      description: summary,
      url: pr.url,
      color: 0x0366d6,
      author: { name: pr.author },
      fields: [
        {
          name: "Files Changed",
          value: pr.changes?.toString() || "Unknown",
          inline: true,
        },
        {
          name: "Status",
          value: pr.state,
          inline: true,
        },
      ],
    }

    console.log("[v0] PR summary generated and stored")
  }

  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "completed",
      result: { prSummary: summary },
    },
  })
}

async function categorizeIssueJob(job: any) {
  const { issueId, title, body } = job.data

  const { category, severity } = await categorizeIssue(title, body)

  // Update issue
  await prisma.githubIssue.update({
    where: { id: issueId },
    data: {
      aiCategory: category,
    },
  })

  console.log(`[v0] Issue categorized as ${category} with severity ${severity}`)

  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "completed",
      result: { category, severity },
    },
  })
}

async function generateSummaryJob(job: any) {
  const { repoId, days } = job.data

  const summary = await generateDailySummary(repoId, days)

  console.log("[v0] Daily summary generated")

  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "completed",
      result: { summary },
    },
  })
}

async function repoInsightsJob(job: any) {
  const { repoId } = job.data

  const insights = await generateRepositoryInsights(repoId)

  console.log("[v0] Repository insights generated")

  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "completed",
      result: insights,
    },
  })
}
