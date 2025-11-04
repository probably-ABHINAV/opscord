import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Create demo user with test data
    const demoUser = await prisma.user.upsert({
      where: { email: "demo@devsync.dev" },
      update: {},
      create: {
        email: "demo@devsync.dev",
        name: "Demo User",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
        profile: {
          create: {
            username: "demo_user",
            displayName: "Demo User",
            avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
          },
        },
        repositories: {
          create: [
            {
              name: "awesome-project",
              owner: "devsync",
              fullName: "devsync/awesome-project",
              url: "https://github.com/devsync/awesome-project",
              description: "An awesome project with AI integration",
              isActive: true,
            },
            {
              name: "api-server",
              owner: "devsync",
              fullName: "devsync/api-server",
              url: "https://github.com/devsync/api-server",
              description: "Backend API server",
              isActive: true,
            },
          ],
        },
        gamification: {
          create: {
            level: 5,
            totalXp: 2500,
            currentLevelXp: 500,
            badges: ["first_pr", "hundred_commits", "pr_master"],
            streak: 12,
          },
        },
      },
      include: {
        profile: true,
        repositories: true,
        gamification: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: demoUser,
      message: "Demo user created successfully",
    })
  } catch (error) {
    console.error("[v0] Error creating demo user:", error)
    return NextResponse.json({ success: false, error: "Failed to create demo user" }, { status: 500 })
  }
}
