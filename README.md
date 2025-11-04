# DevSync++ - AI-Powered GitHub ↔ Discord DevOps Hub

Transform any Discord server into a smart DevOps cockpit with real-time GitHub integration, AI-powered insights, and team gamification.

## Features

### Core Integrations
- Real-time GitHub → Discord event syncing
- Slash commands for PR management and deployments
- Automatic PR summarization with GPT-4
- Issue categorization and severity detection
- Multi-repo/org support

### AI Capabilities
- PR Review Agent: Code analysis and improvement suggestions
- Daily Standup Generator: Automated activity summaries
- Issue Q&A Agent: Natural language repository queries
- Repository Health Analyzer: Insights and recommendations
- Gamification Insights: Achievement recognition

### Discord Features
- `/create-issue` - Create GitHub issues from Discord
- `/merge-pr` - Merge pull requests with Discord buttons
- `/deploy` - Trigger deployments
- `/leaderboard` - View contributor rankings
- `/summarize` - Get AI activity summary
- Reaction-based actions (✅ approve, 🚀 deploy, 🐛 bug)

### Gamification
- XP system for contributions
- Badges and achievements
- Weekly/all-time leaderboards
- Contribution streaks
- AI recognition posts

### Admin Tools
- Hidden admin panel (`/hidden`) with system monitoring
- Webhook latency tracking
- Job queue visualization
- Service health monitoring
- Real-time event logs

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **UI**: Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Authentication**: NextAuth.js with OAuth (GitHub, Google, Discord)
- **AI**: OpenAI GPT-4o-mini
- **Queue**: Redis (Upstash) + BullMQ
- **Discord**: discord.js v14
- **GitHub**: Octokit + GraphQL

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ or Supabase account
- GitHub, Google, Discord OAuth apps

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/devsync-plus.git
cd devsync-plus
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Setup environment variables:
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your credentials
\`\`\`

4. Setup database:
\`\`\`bash
npx prisma db push
npx prisma generate
\`\`\`

5. Run migrations:
\`\`\`bash
npm run db:push
\`\`\`

6. Start development server:
\`\`\`bash
npm run dev
\`\`\`

7. Open [http://localhost:3000](http://localhost:3000)

## Environment Setup

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed configuration of all OAuth providers and services.

Quick checklist:
- [ ] Database (Supabase)
- [ ] NextAuth Secret
- [ ] GitHub OAuth
- [ ] Google OAuth
- [ ] Discord OAuth + Bot
- [ ] OpenAI API
- [ ] GitHub PAT Token
- [ ] Upstash Redis

## Project Structure

\`\`\`
/
├── app/
│   ├── auth/           # Authentication pages
│   ├── api/            # API routes & webhooks
│   ├── dashboard/      # Main dashboard
│   ├── hidden/         # Admin panel
│   └── layout.tsx      # Root layout
├── lib/
│   ├── ai-client.ts    # OpenAI integration
│   ├── discord-client.ts
│   ├── github-client.ts
│   ├── gamification.ts
│   └── prisma.ts
├── workers/
│   ├── ai-worker.ts
│   ├── github-worker.ts
│   └── discord-worker.ts
├── components/
│   ├── dashboard/
│   ├── ui/            # Shadcn components
│   └── gamification/
├── prisma/
│   └── schema.prisma  # Database schema
└── auth.ts            # NextAuth config
\`\`\`

## Usage

### For Users
1. Sign up with GitHub/Google/Discord
2. Connect your repositories
3. Add DevSync bot to Discord server
4. Configure which events to track
5. Start using slash commands!

### For Admins
1. Access `/hidden` dashboard
2. Monitor system health and latency
3. View webhook events in real-time
4. Manage role mappings and permissions
5. Check AI agent status

## API Endpoints

### Public
- `POST /api/auth/register` - User registration
- `POST /api/github/webhook` - GitHub webhook receiver
- `POST /api/discord/interactions` - Discord interactions
- `GET /api/gamification/stats` - User gamification stats

### Protected
- `GET /api/queue/stats` - Job queue statistics
- `POST /api/discord/register-commands` - Register slash commands
- `POST /api/github/connect` - Connect GitHub organization

## Database Schema

Key models:
- **User**: Auth users with gamification stats
- **Repo**: GitHub repositories
- **PullRequest**: Tracked PRs with AI summaries
- **GithubIssue**: Tracked issues with categorization
- **DiscordServer**: Connected Discord servers
- **Job**: Async job queue for workers
- **Leaderboard**: XP rankings
- **AuditLog**: Event tracking

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel dashboard
3. Add environment variables
4. Deploy!

\`\`\`bash
# Deploy command
npm run build
npm start
\`\`\`

### Docker

\`\`\`dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD npm start
\`\`\`

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file

## Support

- GitHub Issues: [Report bugs](https://github.com/yourusername/devsync-plus/issues)
- Discord: [Join community](https://discord.gg/devsync)
- Email: support@devsync.dev

## Roadmap

- [ ] Slack integration
- [ ] Jenkins/CircleCI integration
- [ ] Custom workflow builder
- [ ] Multi-language AI agents
- [ ] Advanced analytics dashboard
- [ ] Community marketplace for agents

## Credits

Built with Next.js, Discord.js, OpenAI, and the amazing open-source community.

---

Made with love for developers, by developers. 💙
