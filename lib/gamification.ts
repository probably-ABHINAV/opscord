import { prisma } from "@/lib/prisma"

const BADGE_DEFINITIONS = {
  TOP_REVIEWER: {
    name: "Top Reviewer",
    icon: "👑",
    description: "Reviewed 50+ pull requests",
    requirement: (stats: any) => stats.reviewCount >= 50,
  },
  SPEED_COMMITTER: {
    name: "Speed Committer",
    icon: "⚡",
    description: "10+ commits in a single day",
    requirement: (stats: any) => stats.dailyCommits >= 10,
  },
  BUG_CRUSHER: {
    name: "Bug Crusher",
    icon: "🐛",
    description: "Fixed 20+ bugs",
    requirement: (stats: any) => stats.bugCount >= 20,
  },
  DOCUMENTATION_MASTER: {
    name: "Documentation Master",
    icon: "📚",
    description: "Created 10+ documentation PRs",
    requirement: (stats: any) => stats.docCount >= 10,
  },
  CONTRIBUTOR_STREAK: {
    name: "On a Roll",
    icon: "🔥",
    description: "30 day contribution streak",
    requirement: (stats: any) => stats.streak >= 30,
  },
}

export async function awardXP(userId: string, amount: number, reason: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) throw new Error("User not found")

  const newXP = user.xp + amount

  await prisma.user.update({
    where: { id: userId },
    data: { xp: newXP },
  })

  await prisma.auditLog.create({
    data: {
      userId,
      eventType: "XP_AWARDED",
      action: `Awarded ${amount} XP`,
      payload: { amount, reason },
    },
  })

  // Check for badge unlocks
  await checkBadgeUnlocks(userId)
}

export async function awardBadge(userId: string, badgeKey: keyof typeof BADGE_DEFINITIONS): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) throw new Error("User not found")

  const badges = user.badges || []
  if (badges.includes(badgeKey)) return // Already has badge

  badges.push(badgeKey)

  await prisma.user.update({
    where: { id: userId },
    data: { badges },
  })

  await prisma.auditLog.create({
    data: {
      userId,
      eventType: "BADGE_AWARDED",
      action: `Awarded ${BADGE_DEFINITIONS[badgeKey].name} badge`,
      payload: { badge: badgeKey },
    },
  })
}

export async function checkBadgeUnlocks(userId: string): Promise<void> {
  const contribution = await prisma.contribution.aggregate({
    where: { userId },
    _sum: { prs: true, issues: true },
    _count: true,
  })

  const leaderboard = await prisma.leaderboard.findUnique({
    where: { userId },
  })

  const stats = {
    prCount: leaderboard?.prCount || 0,
    reviewCount: leaderboard?.reviewCount || 0,
    bugCount: leaderboard?.bugCount || 0,
    docCount: 0, // Would be tracked separately
    dailyCommits: 0, // Would need additional tracking
    streak: 0, // Would need date tracking
  }

  // Check each badge
  for (const [badgeKey, badge] of Object.entries(BADGE_DEFINITIONS)) {
    if (badge.requirement(stats)) {
      await awardBadge(userId, badgeKey as keyof typeof BADGE_DEFINITIONS)
    }
  }
}

export async function updateLeaderboard(userId: string): Promise<void> {
  const contributions = await prisma.contribution.findMany({
    where: { userId },
  })

  const totalPRs = contributions.reduce((sum, c) => sum + c.prs, 0)
  const totalXP =
    (
      await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true },
      })
    )?.xp || 0

  let leaderboard = await prisma.leaderboard.findUnique({
    where: { userId },
  })

  if (!leaderboard) {
    leaderboard = await prisma.leaderboard.create({
      data: { userId, xpTotal: totalXP, prCount: totalPRs },
    })
  } else {
    leaderboard = await prisma.leaderboard.update({
      where: { userId },
      data: {
        xpTotal: totalXP,
        prCount: totalPRs,
      },
    })
  }

  // Update rank
  const higherRanked = await prisma.leaderboard.count({
    where: { xpTotal: { gt: leaderboard.xpTotal } },
  })

  await prisma.leaderboard.update({
    where: { userId },
    data: { rank: higherRanked + 1 },
  })
}

export async function recordPullRequest(
  userId: string,
  repoId: string,
  title: string,
  labels: string[] = [],
): Promise<void> {
  const isDocChange =
    title.toLowerCase().includes("doc") || labels.some((l) => l.toLowerCase().includes("documentation"))

  let contribution = await prisma.contribution.findUnique({
    where: { userId_repoId: { userId, repoId } },
  })

  if (!contribution) {
    contribution = await prisma.contribution.create({
      data: { userId, repoId, prs: 1 },
    })
  } else {
    contribution = await prisma.contribution.update({
      where: { userId_repoId: { userId, repoId } },
      data: { prs: contribution.prs + 1 },
    })
  }

  // Award XP
  const xpAmount = isDocChange ? 25 : 50
  await awardXP(userId, xpAmount, `Merged PR: ${title}`)

  // Update leaderboard
  await updateLeaderboard(userId)
}

export async function getLeaderboardTop(limit = 10) {
  return prisma.leaderboard.findMany({
    orderBy: { xpTotal: "desc" },
    take: limit,
    select: {
      userId: true,
      xpTotal: true,
      prCount: true,
      reviewCount: true,
      rank: true,
    },
  })
}

export async function getUserStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, badges: true, streak: true },
  })

  const leaderboard = await prisma.leaderboard.findUnique({
    where: { userId },
  })

  const contributions = await prisma.contribution.findMany({
    where: { userId },
  })

  return {
    xp: user?.xp || 0,
    badges: user?.badges || [],
    streak: user?.streak || 0,
    rank: leaderboard?.rank || 0,
    totalPRs: leaderboard?.prCount || 0,
    totalReviews: leaderboard?.reviewCount || 0,
    repoContributions: contributions,
  }
}
