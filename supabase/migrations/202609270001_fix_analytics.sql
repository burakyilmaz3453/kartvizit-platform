begin;

with ranked as (
  select ctid, row_number() over (partition by username order by updated_at desc, ctid desc) as position,
         sum(count) over (partition by username) as total_count
  from public.profile_views
)
update public.profile_views as views
set count = ranked.total_count,
    updated_at = now()
from ranked
where views.ctid = ranked.ctid and ranked.position = 1;

with ranked as (
  select ctid, row_number() over (partition by username order by updated_at desc, ctid desc) as position
  from public.profile_views
)
delete from public.profile_views as views
using ranked
where views.ctid = ranked.ctid and ranked.position > 1;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profile_views'::regclass
      and conname = 'profile_views_username_key'
  ) then
    alter table public.profile_views
      add constraint profile_views_username_key unique (username);
  end if;
end
$$;

create or replace function public.record_profile_view(p_username text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_username text := lower(trim(p_username));
begin
  if length(normalized_username) > 32 or not exists (
    select 1 from public.profiles where username = normalized_username
  ) then
    return;
  end if;

  insert into public.profile_views (username, count, updated_at)
  values (normalized_username, 1, now())
  on conflict (username) do update
    set count = public.profile_views.count + 1,
        updated_at = now();
end;
$$;

create or replace function public.record_link_click(p_username text, p_link_type text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_username text := lower(trim(p_username));
  normalized_link_type text := lower(trim(p_link_type));
begin
  if length(normalized_username) > 32
     or normalized_link_type is null
     or not (normalized_link_type = any (array[
       'mobile', 'work_phone', 'email', 'website', 'address',
       'linkedin', 'instagram', 'twitter', 'facebook', 'whatsapp',
       'qr', 'save'
     ]::text[]))
     or not exists (
       select 1 from public.profiles where username = normalized_username
     ) then
    return;
  end if;

  insert into public.link_clicks (username, link_type)
  values (normalized_username, normalized_link_type);
end;
$$;

revoke all on function public.record_profile_view(text) from public;
revoke all on function public.record_link_click(text, text) from public;
grant execute on function public.record_profile_view(text) to anon, authenticated;
grant execute on function public.record_link_click(text, text) to anon, authenticated;

commit;
