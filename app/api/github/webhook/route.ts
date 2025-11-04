import { verifyWebhookSignature, processGitHubWebhook } from "@/lib/github-client"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("x-hub-signature-256") || ""
  const eventType = req.headers.get("x-github-event") || ""

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 })
  }

  // Get the repo to verify signature
  const payload = JSON.parse(body)
  const repo = await prisma.repo.findUnique({
    where: { fullName: payload.repository?.full_name },
  })

  if (!repo || !repo.webhookSecret) {
    return NextResponse.json({ error: "Repository not found or not configured" }, { status: 404 })
  }

  const isValid = await verifyWebhookSignature(body, signature, repo.webhookSecret)

  if (!isValid) {
    console.warn("[v0] Invalid webhook signature for", repo.fullName)
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  // Process supported events
  const supportedEvents = ["pull_request", "issues", "push"]
  if (supportedEvents.includes(eventType)) {
    await processGitHubWebhook(payload)
  }

  return NextResponse.json({ success: true })
}
