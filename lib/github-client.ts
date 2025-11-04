import { Octokit } from "octokit"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export async function verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(payload)
  const digest = `sha256=${hmac.digest("hex")}`
  return signature === digest
}

export async function createGitHubIssue(
  owner: string,
  repo: string,
  title: string,
  body: string,
  labels: string[] = [],
) {
  const response = await octokit.rest.issues.create({
    owner,
    repo,
    title,
    body,
    labels,
  })
  return response.data
}

export async function mergePullRequest(
  owner: string,
  repo: string,
  prNumber: number,
  commitTitle?: string,
  commitMessage?: string,
) {
  const response = await octokit.rest.pulls.merge({
    owner,
    repo,
    pull_number: prNumber,
    commit_title: commitTitle,
    commit_message: commitMessage,
  })
  return response.data
}

export async function getPullRequestDiff(owner: string, repo: string, prNumber: number) {
  const response = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  })
  return response.data
}

export async function addPullRequestComment(owner: string, repo: string, issueNumber: number, body: string) {
  const response = await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  })
  return response.data
}

export async function createGithubCheck(
  owner: string,
  repo: string,
  headSha: string,
  name: string,
  status: "queued" | "in_progress" | "completed",
  conclusion?: string,
) {
  const response = await octokit.rest.checks.create({
    owner,
    repo,
    name,
    head_sha: headSha,
    status,
    conclusion: conclusion as any,
  })
  return response.data
}

export async function processGitHubWebhook(payload: any) {
  const eventType = payload.repository?.name

  if (!eventType) return

  try {
    // Store webhook log
    const repo = await prisma.repo.findUnique({
      where: { fullName: payload.repository.full_name },
    })

    if (!repo) {
      console.error(`[v0] Repository not found: ${payload.repository.full_name}`)
      return
    }

    await prisma.webhookLog.create({
      data: {
        repoId: repo.id,
        eventType: payload.action || "unknown",
        eventData: payload,
        status: "processing",
      },
    })

    // Handle different event types
    if (payload.action === "opened" && payload.pull_request) {
      await handlePullRequestOpened(repo, payload)
    } else if (payload.action === "opened" && payload.issue) {
      await handleIssueOpened(repo, payload)
    } else if (payload.ref === "refs/heads/main" && payload.commits) {
      await handlePush(repo, payload)
    }
  } catch (error) {
    console.error("[v0] Webhook processing error:", error)
  }
}

async function handlePullRequestOpened(repo: any, payload: any) {
  const pr = payload.pull_request

  // Store PR in database
  const prRecord = await prisma.pullRequest.upsert({
    where: {
      repoId_prNumber: {
        repoId: repo.id,
        prNumber: pr.number,
      },
    },
    update: {
      title: pr.title,
      body: pr.body,
      state: pr.state,
    },
    create: {
      repoId: repo.id,
      prNumber: pr.number,
      title: pr.title,
      body: pr.body || "",
      author: pr.user.login,
      url: pr.html_url,
      state: pr.state,
      changes: pr.changed_files,
    },
  })

  // Queue AI summary job
  if (repo.autoSummarize) {
    await prisma.job.create({
      data: {
        type: "SUMMARIZE_PR",
        status: "pending",
        data: {
          prId: prRecord.id,
          repoId: repo.id,
          prNumber: pr.number,
          owner: repo.owner,
          repoName: repo.name,
        },
      },
    })
  }
}

async function handleIssueOpened(repo: any, payload: any) {
  const issue = payload.issue

  // Store issue in database
  const issueRecord = await prisma.githubIssue.upsert({
    where: {
      repoId_issueNumber: {
        repoId: repo.id,
        issueNumber: issue.number,
      },
    },
    update: {
      title: issue.title,
      body: issue.body,
      state: issue.state,
      labels: issue.labels.map((l: any) => l.name),
    },
    create: {
      repoId: repo.id,
      issueNumber: issue.number,
      title: issue.title,
      body: issue.body || "",
      author: issue.user.login,
      url: issue.html_url,
      state: issue.state,
      labels: issue.labels.map((l: any) => l.name),
    },
  })

  // Queue categorization job
  await prisma.job.create({
    data: {
      type: "CATEGORIZE_ISSUE",
      status: "pending",
      data: {
        issueId: issueRecord.id,
        repoId: repo.id,
        issueNumber: issue.number,
        title: issue.title,
        body: issue.body,
      },
    },
  })
}

async function handlePush(repo: any, payload: any) {
  // Store push event
  await prisma.job.create({
    data: {
      type: "PROCESS_PUSH",
      status: "pending",
      data: {
        repoId: repo.id,
        commits: payload.commits,
        branch: payload.ref.replace("refs/heads/", ""),
      },
    },
  })
}
