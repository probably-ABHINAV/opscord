import { verifyGitHubSignature, processGitHubWebhook } from "@/lib/github"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-hub-signature-256")
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    const payload = await request.text()
    const event = request.headers.get("x-github-event")
    const delivery = request.headers.get("x-github-delivery")

    // Extract repo info from payload to find webhook secret
    const payloadObj = JSON.parse(payload)
    const repoFullName = payloadObj.repository.full_name
    const [owner, repoName] = repoFullName.split("/")

    // Get webhook secret from database
    const supabase = await createClient()
    const { data: orgData, error: orgError } = await supabase
      .from("github_organizations")
      .select("webhook_secret, id")
      .eq("github_owner", owner)
      .single()

    if (orgError || !orgData) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Verify signature
    const isValid = await verifyGitHubSignature(payload, signature, orgData.webhook_secret)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Get repo
    const { data: repoData, error: repoError } = await supabase
      .from("github_repositories")
      .select("id")
      .eq("org_id", orgData.id)
      .eq("repo_name", repoName)
      .single()

    if (repoError || !repoData) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    // Process webhook
    const result = await processGitHubWebhook(payloadObj, repoData.id)

    // If PR needs summarization, queue it
    if (result.needsSummarization) {
      const { data: orgUser } = await supabase
        .from("github_organizations")
        .select("user_id")
        .eq("id", orgData.id)
        .single()

      if (orgUser?.user_id) {
        await supabase.from("job_queue").insert({
          user_id: orgUser.user_id,
          job_type: "pr_summary",
          job_data: {
            repo_id: repoData.id,
            pr_number: result.prNumber,
            repo_full_name: repoFullName,
          },
          status: "pending",
        })
      }
    }

    return NextResponse.json({ success: true, event, delivery })
  } catch (error) {
    console.error("[GitHub Webhook] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
