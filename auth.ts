import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Discord from "next-auth/providers/discord"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      if (account) {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.provider = token.provider as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      try {
        // Get or create user in database
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email || "" },
        })

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email || "",
              name: user.name || "",
              image: user.image || "",
              discordId: account?.provider === "discord" ? profile?.id : undefined,
              githubId: account?.provider === "github" ? Number.parseInt(profile?.id || "0") : undefined,
              profile: {
                create: {
                  username: user.name || "",
                  displayName: user.name || "",
                  avatarUrl: user.image || "",
                },
              },
            },
            include: { profile: true },
          })
        } else {
          // Update provider IDs
          if (account?.provider === "discord" && profile?.id) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { discordId: profile.id },
            })
          }
          if (account?.provider === "github" && profile?.id) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { githubId: Number.parseInt(profile.id) },
            })
          }
        }

        return true
      } catch (error) {
        console.error("SignIn error:", error)
        return false
      }
    },
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/sign-up",
  },
  trustHost: true,
})
