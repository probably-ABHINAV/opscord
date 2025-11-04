-- Generate webhook secrets using crypto extension
create extension if not exists pgcrypto;

-- Function to generate random webhook secret
create or replace function public.generate_webhook_secret()
returns text
language plpgsql
as $$
begin
  return encode(gen_random_bytes(32), 'hex');
end;
$$;

-- Update github_organizations to use auto-generated secrets
alter table public.github_organizations
alter column webhook_secret set default public.generate_webhook_secret();
