import { registerSlashCommands } from "@/lib/discord-client"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await registerSlashCommands()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Command registration failed:", error)
    return NextResponse.json({ error: "Failed to register commands" }, { status: 500 })
  }
}
