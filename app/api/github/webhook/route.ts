import { cookies } from "next/headers"
import { sendDiscordMessage } from "@/lib/discord"
import type { NextRequest } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-hub-signature-256")
    const body = await request.text()

    // Verify webhook signature
    const secret = process.env.GITHUB_WEBHOOK_SECRET || ""
    if (signature && secret) {
      const hash = crypto.createHmac("sha256", secret).update(body).digest("hex")
      const expected = `sha256=${hash}`

      if (signature !== expected) {
        return Response.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const event = JSON.parse(body)
    const cookieStore = await cookies()
    const webhookUrl = cookieStore.get("discord_webhook")?.value

    if (!webhookUrl) {
      return Response.json({ success: true })
    }

    // Handle different event types
    let message = ""
    let title = ""

    if (event.action === "opened" && event.pull_request) {
      title = "New Pull Request"
      message = `[${event.repository.name}] ${event.pull_request.title}\n${event.pull_request.html_url}`
    } else if (event.action === "opened" && event.issue) {
      title = "New Issue"
      message = `[${event.repository.name}] ${event.issue.title}\n${event.issue.html_url}`
    } else if (event.action === "synchronize" && event.pull_request) {
      title = "Pull Request Updated"
      message = `[${event.repository.name}] ${event.pull_request.title}\n${event.pull_request.html_url}`
    } else if (event.ref && event.repository) {
      title = "New Push"
      const branch = event.ref.split("/").pop()
      message = `[${event.repository.name}:${branch}] ${event.commits?.length || 0} commits`
    }

    if (message) {
      await sendDiscordMessage(webhookUrl, message, title)
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return Response.json({ success: true })
  }
}
