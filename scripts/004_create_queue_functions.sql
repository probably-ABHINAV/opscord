-- Function to get queue statistics
create or replace function public.get_queue_stats(user_id_param uuid)
returns table (
  pending bigint,
  processing bigint,
  completed bigint,
  failed bigint
)
language sql
security definer
as $$
  select
    count(*) filter (where status = 'pending') as pending,
    count(*) filter (where status = 'processing') as processing,
    count(*) filter (where status = 'completed') as completed,
    count(*) filter (where status = 'failed') as failed
  from public.job_queue
  where user_id = user_id_param;
$$;

-- Function to clean up old completed jobs (older than 30 days)
create or replace function public.cleanup_old_jobs()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.job_queue
  where status = 'completed'
    and completed_at < now() - interval '30 days';
    
  delete from public.webhook_logs
  where created_at < now() - interval '90 days';
end;
$$;

-- Create index on job status and created_at for efficient queue processing
create index if not exists idx_job_queue_status_created on public.job_queue(status, created_at);
create index if not exists idx_job_queue_priority on public.job_queue(priority desc, created_at);
