import { verifyKey } from "discord-interactions"
import { handleInteraction } from "@/lib/discord-client"
import { NextResponse } from "next/server"

const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || ""

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("x-signature-ed25519") || ""
  const timestamp = req.headers.get("x-signature-timestamp") || ""

  if (!verifyKey(body, signature, timestamp, PUBLIC_KEY)) {
    return NextResponse.json({ error: "Invalid request signature" }, { status: 401 })
  }

  const data = JSON.parse(body)

  if (data.type === 1) {
    return NextResponse.json({ type: 1 })
  }

  if (data.type === 2) {
    try {
      await handleInteraction(data)
      return NextResponse.json({ type: 4, data: { content: "Processing..." } })
    } catch (error) {
      console.error("[v0] Interaction error:", error)
      return NextResponse.json({ error: "Failed to process interaction" }, { status: 500 })
    }
  }

  return NextResponse.json({ error: "Unknown interaction type" }, { status: 400 })
}
