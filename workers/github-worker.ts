import { prisma } from "@/lib/prisma"
import { createGitHubIssue, mergePullRequest } from "@/lib/github-client"

export async function processGitHubJob(job: any) {
  try {
    switch (job.type) {
      case "CREATE_ISSUE":
        await createIssueJob(job)
        break
      case "MERGE_PR":
        await mergePRJob(job)
        break
      case "PROCESS_PUSH":
        await processPushJob(job)
        break
      default:
        console.log("[v0] Unknown job type:", job.type)
    }
  } catch (error) {
    console.error("[v0] GitHub worker error:", error)
    throw error
  }
}

async function createIssueJob(job: any) {
  const { repoId, title, description, labels } = job.data
  const repo = await prisma.repo.findUnique({ where: { id: repoId } })

  if (!repo) throw new Error("Repository not found")

  const issue = await createGitHubIssue(repo.owner, repo.name, title, description, labels)

  console.log(`[v0] Created issue #${issue.number}`)

  // Update job status
  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "completed",
      result: { issueNumber: issue.number, url: issue.html_url },
    },
  })
}

async function mergePRJob(job: any) {
  const { repoId, prNumber } = job.data
  const repo = await prisma.repo.findUnique({ where: { id: repoId } })

  if (!repo) throw new Error("Repository not found")

  const merged = await mergePullRequest(repo.owner, repo.name, prNumber)

  console.log(`[v0] Merged PR #${prNumber}`)

  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "completed",
      result: merged,
    },
  })
}

async function processPushJob(job: any) {
  const { repoId, commits, branch } = job.data
  const repo = await prisma.repo.findUnique({ where: { id: repoId } })

  if (!repo) throw new Error("Repository not found")

  console.log(`[v0] Processing push to ${branch} with ${commits.length} commits`)

  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "completed",
      result: { commitsProcessed: commits.length },
    },
  })
}
