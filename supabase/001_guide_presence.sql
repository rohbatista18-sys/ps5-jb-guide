-- PS5 JB Guide: online counter and page views, in the SAME Supabase project as ps5-jb-tracker
-- but counted separately. Run once in Supabase → SQL Editor, after the tracker's
-- supabase/001_counters.sql (it reuses that file's public.counters table). Safe to re-run.
--
-- Separation from the tracker:
--   * online tabs live in their own table (guide_presence); the tracker counts public.presence;
--   * page views use the counter key 'guide:pageviews'; the tracker uses 'pageviews'.
-- Nothing the tracker reads or writes is changed.

create table if not exists public.guide_presence (
  id uuid primary key,             -- random per-tab id; no IP, UA or other visitor data
  seen_at timestamptz not null
);
create index if not exists guide_presence_seen_at_idx on public.guide_presence (seen_at);

alter table public.guide_presence enable row level security;

-- One call per server flush: upsert heartbeats ({"<uuid>": <epoch ms>}), drop tabs that left and
-- tabs not seen within ttl_seconds, add page views; returns the guide's online count and total.
create or replace function public.guide_presence_flush(beats jsonb, gone uuid[], ttl_seconds int, views bigint)
returns table (online bigint, pageviews bigint)
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.guide_presence (id, seen_at)
  select b.key::uuid, to_timestamp(b.value::double precision / 1000)
  from jsonb_each_text(beats) as b(key, value)
  on conflict (id) do update set seen_at = greatest(public.guide_presence.seen_at, excluded.seen_at);

  if coalesce(array_length(gone, 1), 0) > 0 then
    delete from public.guide_presence where id = any(gone);
  end if;
  delete from public.guide_presence where seen_at < now() - make_interval(secs => ttl_seconds);

  if views > 0 then
    insert into public.counters as c (key, value) values ('guide:pageviews', views)
    on conflict (key) do update set value = c.value + excluded.value;
  end if;

  return query
    select (select count(*) from public.guide_presence),
           coalesce((select c.value from public.counters c where c.key = 'guide:pageviews'), 0);
end;
$$;

revoke all on table public.guide_presence from anon, authenticated;
revoke execute on function public.guide_presence_flush(jsonb, uuid[], int, bigint) from public, anon, authenticated;
grant select, insert, update, delete on table public.guide_presence to service_role;
grant execute on function public.guide_presence_flush(jsonb, uuid[], int, bigint) to service_role;
