# DevSync++ Environment Configuration Guide

## Quick Start

This guide walks you through setting up all required environment variables for DevSync++.

## Prerequisites

- Node.js 18+
- Git
- PostgreSQL 14+ (or use Supabase)
- Discord Server
- GitHub Organization/Account

## Step 1: Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In Project Settings → API, copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Get connection string from Database Settings

\`\`\`bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
\`\`\`

## Step 2: NextAuth Configuration

Generate a secure secret:
\`\`\`bash
openssl rand -base64 32
\`\`\`

Add to `.env`:
\`\`\`
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000
\`\`\`

## Step 3: GitHub OAuth Setup

1. Go to [github.com/settings/developers/apps](https://github.com/settings/developers/apps)
2. Click "New GitHub App"
3. Fill in:
   - **App Name**: DevSync++
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy:
   - App ID → `GITHUB_ID`
   - Generate Private Key → convert to base64 for `GITHUB_PRIVATE_KEY`
5. Set permissions:
   - Repository access: Read/Write
   - Pull requests: Read/Write
   - Issues: Read/Write

## Step 4: Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project
3. Go to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy:
   - Client ID → `GOOGLE_CLIENT_ID`
   - Client Secret → `GOOGLE_CLIENT_SECRET`

## Step 5: Discord Setup

### Create Discord Application

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "DevSync++"
4. Go to OAuth2 → General
5. Copy **Client ID** → `DISCORD_CLIENT_ID`
6. Generate Client Secret → `DISCORD_CLIENT_SECRET`
7. Add Redirect URL: `http://localhost:3000/api/auth/callback/discord`

### Create Discord Bot

1. Go to Bot Settings
2. Click "Add Bot"
3. Copy **Token** → `DISCORD_TOKEN`
4. Under TOKEN, copy **Public Key** → `DISCORD_PUBLIC_KEY`
5. Set permissions (in OAuth2):
   - `bot`
   - `applications.commands`
6. Under "Bot Permissions", select:
   - Send Messages
   - Send Messages in Threads
   - Embed Links
   - Mention @everyone, @here, and All Roles
   - Read Message History
   - Use Slash Commands
   - Manage Messages

## Step 6: OpenAI API

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new API key
3. Copy → `OPENAI_API_KEY`

## Step 7: GitHub Personal Access Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Name: "DevSync++ Bot"
4. Select scopes:
   - `repo` (full control)
   - `admin:repo_hook` (webhook management)
   - `user` (public user data)
5. Copy → `GITHUB_TOKEN`

## Step 8: Upstash Redis (Job Queue)

1. Go to [upstash.com/console](https://upstash.com/console)
2. Create new Redis database
3. Go to Details tab
4. Copy:
   - REST API URL → `UPSTASH_KV_REST_API_URL`
   - REST API Token → `UPSTASH_KV_REST_API_TOKEN`

## Step 9: Local Development

1. Create `.env.local`:
\`\`\`bash
cp .env.example .env.local
\`\`\`

2. Fill in all values from above steps

3. Run Prisma migrations:
\`\`\`bash
npx prisma db push
npx prisma generate
\`\`\`

4. Register Discord slash commands:
\`\`\`bash
curl -X POST http://localhost:3000/api/discord/register-commands
\`\`\`

5. Start dev server:
\`\`\`bash
npm run dev
\`\`\`

## Step 10: Deployment (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import GitHub repository
4. Add environment variables in Settings → Environment Variables
5. Deploy!

## Troubleshooting

### Discord Bot Not Responding
- Check `DISCORD_TOKEN` is correct
- Verify bot has permissions in server
- Check webhook URL is accessible

### GitHub Webhooks Not Firing
- Verify webhook secret matches
- Check GitHub organization webhook settings
- Ensure GitHub token has `admin:repo_hook` scope

### OpenAI API Errors
- Verify API key is valid
- Check account has credits
- Ensure rate limits not exceeded

## Support

For issues, check:
- GitHub Issues: github.com/devsync/devsync-plus/issues
- Discord: discord.gg/devsync
