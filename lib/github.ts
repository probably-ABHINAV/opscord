import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export interface GitHubWebhookPayload {
  action: string
  pull_request?: {
    number: number
    title: string
    body: string
    user: { login: string }
    html_url: string
    state: string
  }
  issue?: {
    number: number
    title: string
    body: string
    user: { login: string }
    html_url: string
    state: string
    labels?: Array<{ name: string }>
  }
  repository: {
    id: number
    full_name: string
    name: string
  }
}

export async function verifyGitHubSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const hash = crypto.createHmac("sha256", secret).update(payload).digest("hex")
  const expectedSignature = `sha256=${hash}`
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

export async function processGitHubWebhook(payload: GitHubWebhookPayload, repoId: string) {
  const supabase = await createClient()

  try {
    // Log webhook event
    await supabase.from("webhook_logs").insert({
      repo_id: repoId,
      event_type: payload.action,
      event_data: payload,
      status: "received",
    })

    if (payload.pull_request) {
      // Handle PR events
      const { number, title, body, user, html_url, state } = payload.pull_request

      const { error } = await supabase.from("github_pull_requests").upsert(
        {
          repo_id: repoId,
          pr_number: number,
          pr_title: title,
          pr_body: body || null,
          author_github_username: user.login,
          url: html_url,
          state,
        },
        { onConflict: "repo_id,pr_number" },
      )

      if (error) throw error

      // Queue PR summarization if it's opened or reopened
      if (payload.action === "opened" || payload.action === "reopened") {
        // Will be processed by job queue
        return {
          event: "pr_opened",
          prNumber: number,
          needsSummarization: true,
        }
      }
    } else if (payload.issue) {
      // Handle issue events
      const { number, title, body, user, html_url, state, labels } = payload.issue

      const { error } = await supabase.from("github_issues").upsert(
        {
          repo_id: repoId,
          issue_number: number,
          issue_title: title,
          issue_body: body || null,
          author_github_username: user.login,
          url: html_url,
          state,
          labels: labels?.map((l) => l.name) || [],
        },
        { onConflict: "repo_id,issue_number" },
      )

      if (error) throw error

      return { event: "issue_update", issueNumber: number }
    }

    return { event: "processed" }
  } catch (error) {
    console.error("[GitHub Webhook] Error processing:", error)
    throw error
  }
}

export async function getGitHubRepoByWebhook(repoName: string, orgId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("github_repositories")
    .select("id")
    .eq("repo_name", repoName)
    .eq("org_id", orgId)
    .single()

  if (error) {
    console.error("[GitHub] Repo lookup error:", error)
    return null
  }

  return data?.id || null
}

export async function storeGitHubOrg(
  userId: string,
  orgName: string,
  orgId: number,
  githubOwner: string,
  webhookSecret: string,
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("github_organizations")
    .insert({
      user_id: userId,
      org_name: orgName,
      org_id: orgId,
      github_owner: githubOwner,
      webhook_secret: webhookSecret,
    })
    .select("id")
    .single()

  if (error) throw error
  return data
}

export async function storeGitHubRepo(
  orgId: string,
  repoName: string,
  repoFullName: string,
  githubRepoId: number,
  autoSummarize = false,
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("github_repositories")
    .insert({
      org_id: orgId,
      repo_name: repoName,
      repo_full_name: repoFullName,
      github_repo_id: githubRepoId,
      auto_summarize: autoSummarize,
    })
    .select("id")
    .single()

  if (error) throw error
  return data
}
