import { storeGitHubOrg, storeGitHubRepo } from "@/lib/github"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

interface ConnectRequest {
  orgName: string
  orgId: number
  githubOwner: string
  repos: Array<{
    name: string
    fullName: string
    id: number
    autoSummarize?: boolean
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
    const { orgName, orgId, githubOwner, repos } = body

    // Generate webhook secret
    const webhookSecret = crypto.randomBytes(32).toString("hex")

    // Store organization
    const orgData = await storeGitHubOrg(userData.user.id, orgName, orgId, githubOwner, webhookSecret)

    // Store repositories
    const repoIds = []
    for (const repo of repos) {
      const repoData = await storeGitHubRepo(orgData.id, repo.name, repo.fullName, repo.id, repo.autoSummarize || false)
      repoIds.push(repoData.id)
    }

    return NextResponse.json({
      success: true,
      webhookSecret,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/github`,
      orgId: orgData.id,
      repoIds,
    })
  } catch (error) {
    console.error("[GitHub Connect] Error:", error)
    return NextResponse.json({ error: "Failed to connect organization" }, { status: 500 })
  }
}
