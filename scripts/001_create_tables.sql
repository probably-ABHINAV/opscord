-- Users table (references auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  github_id text unique,
  discord_id text unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- GitHub Organizations
create table if not exists public.github_organizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  org_name text not null,
  org_id integer not null,
  github_owner text not null,
  webhook_secret text not null,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  unique(user_id, org_name)
);

-- GitHub Repositories
create table if not exists public.github_repositories (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.github_organizations(id) on delete cascade,
  repo_name text not null,
  repo_full_name text not null,
  github_repo_id integer not null,
  is_active boolean default true,
  auto_summarize boolean default false,
  created_at timestamp with time zone default now(),
  unique(org_id, repo_name)
);

-- Discord Servers
create table if not exists public.discord_servers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  guild_id text not null unique,
  guild_name text not null,
  bot_token text not null,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Discord Channels (for notifications)
create table if not exists public.discord_channels (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.discord_servers(id) on delete cascade,
  channel_id text not null,
  channel_name text not null,
  channel_type text default 'text', -- 'text', 'thread', etc.
  repo_id uuid references public.github_repositories(id) on delete set null,
  notification_type text, -- 'pr', 'issue', 'commit', 'release', etc.
  created_at timestamp with time zone default now(),
  unique(server_id, channel_id)
);

-- GitHub Pull Requests (for tracking and summarization)
create table if not exists public.github_pull_requests (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid not null references public.github_repositories(id) on delete cascade,
  pr_number integer not null,
  pr_title text not null,
  pr_body text,
  author_github_username text not null,
  url text not null,
  state text default 'open', -- 'open', 'closed', 'merged'
  ai_summary text,
  discord_message_id text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique(repo_id, pr_number)
);

-- GitHub Issues
create table if not exists public.github_issues (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid not null references public.github_repositories(id) on delete cascade,
  issue_number integer not null,
  issue_title text not null,
  issue_body text,
  author_github_username text not null,
  url text not null,
  state text default 'open',
  labels text[],
  discord_message_id text,
  created_at timestamp with time zone default now(),
  unique(repo_id, issue_number)
);

-- Job Queue (for BullMQ/Redis integration)
create table if not exists public.job_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_type text not null, -- 'pr_summary', 'webhook_process', 'sync_repos', etc.
  job_data jsonb not null,
  status text default 'pending', -- 'pending', 'processing', 'completed', 'failed'
  result jsonb,
  error_message text,
  retry_count integer default 0,
  max_retries integer default 3,
  priority integer default 0,
  created_at timestamp with time zone default now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone
);

-- Bot Configuration (settings for each bot instance)
create table if not exists public.bot_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  config_key text not null,
  config_value jsonb not null,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, config_key)
);

-- Webhooks Log (audit trail)
create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid references public.github_repositories(id) on delete set null,
  event_type text not null,
  event_data jsonb not null,
  status text default 'received',
  response_data jsonb,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.github_organizations enable row level security;
alter table public.github_repositories enable row level security;
alter table public.discord_servers enable row level security;
alter table public.discord_channels enable row level security;
alter table public.github_pull_requests enable row level security;
alter table public.github_issues enable row level security;
alter table public.job_queue enable row level security;
alter table public.bot_configs enable row level security;
alter table public.webhook_logs enable row level security;

-- RLS Policies for profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS Policies for github_organizations
create policy "github_org_select_own"
  on public.github_organizations for select
  using (user_id = auth.uid());

create policy "github_org_insert_own"
  on public.github_organizations for insert
  with check (user_id = auth.uid());

create policy "github_org_update_own"
  on public.github_organizations for update
  using (user_id = auth.uid());

create policy "github_org_delete_own"
  on public.github_organizations for delete
  using (user_id = auth.uid());

-- RLS Policies for github_repositories (inherit from org)
create policy "github_repo_select_own"
  on public.github_repositories for select
  using (
    org_id in (
      select id from public.github_organizations where user_id = auth.uid()
    )
  );

create policy "github_repo_insert_own"
  on public.github_repositories for insert
  with check (
    org_id in (
      select id from public.github_organizations where user_id = auth.uid()
    )
  );

-- RLS Policies for discord_servers
create policy "discord_server_select_own"
  on public.discord_servers for select
  using (user_id = auth.uid());

create policy "discord_server_insert_own"
  on public.discord_servers for insert
  with check (user_id = auth.uid());

create policy "discord_server_update_own"
  on public.discord_servers for update
  using (user_id = auth.uid());

-- RLS Policies for discord_channels
create policy "discord_channel_select_own"
  on public.discord_channels for select
  using (
    server_id in (
      select id from public.discord_servers where user_id = auth.uid()
    )
  );

create policy "discord_channel_insert_own"
  on public.discord_channels for insert
  with check (
    server_id in (
      select id from public.discord_servers where user_id = auth.uid()
    )
  );

-- RLS Policies for job_queue
create policy "job_queue_select_own"
  on public.job_queue for select
  using (user_id = auth.uid());

create policy "job_queue_insert_own"
  on public.job_queue for insert
  with check (user_id = auth.uid());

-- RLS Policies for bot_configs
create policy "bot_config_select_own"
  on public.bot_configs for select
  using (user_id = auth.uid());

create policy "bot_config_insert_own"
  on public.bot_configs for insert
  with check (user_id = auth.uid());

create policy "bot_config_update_own"
  on public.bot_configs for update
  using (user_id = auth.uid());

-- Create indexes for performance
create index if not exists idx_github_org_user on public.github_organizations(user_id);
create index if not exists idx_github_repo_org on public.github_repositories(org_id);
create index if not exists idx_discord_server_user on public.discord_servers(user_id);
create index if not exists idx_discord_channel_server on public.discord_channels(server_id);
create index if not exists idx_pr_repo on public.github_pull_requests(repo_id);
create index if not exists idx_issue_repo on public.github_issues(repo_id);
create index if not exists idx_job_queue_user on public.job_queue(user_id);
create index if not exists idx_job_queue_status on public.job_queue(status);
create index if not exists idx_webhook_logs_repo on public.webhook_logs(repo_id);
