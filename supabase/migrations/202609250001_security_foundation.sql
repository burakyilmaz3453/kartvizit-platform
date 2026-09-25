begin;

alter table public.profiles
  alter column user_id drop default,
  alter column username set not null;

-- The public demo is a system-owned profile, not an Auth identity. Preserve it
-- with a null owner so the foreign key can protect every real user profile.
update public.profiles
set user_id = null
where username = 'demo'
  and user_id is not null
  and not exists (select 1 from auth.users where id = profiles.user_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_user_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_owner_required_check'
  ) then
    alter table public.profiles
      add constraint profiles_owner_required_check
      check ((username = 'demo' and user_id is null) or (username <> 'demo' and user_id is not null));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_username_format_check'
  ) then
    alter table public.profiles
      add constraint profiles_username_format_check
      check (username = lower(username) and username ~ '^[a-z0-9_]{3,32}$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_username_key'
  ) then
    alter table public.profiles
      add constraint profiles_username_key unique (username);
  end if;
end
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text := lower(trim(new.raw_user_meta_data ->> 'username'));
begin
  if requested_username is null or requested_username !~ '^[a-z0-9_]{3,32}$' then
    raise exception 'invalid username';
  end if;

  insert into public.profiles (user_id, username, email)
  values (new.id, requested_username, new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.get_public_profile(p_username text)
returns table (
  username text,
  full_name text,
  company text,
  title text,
  mobile text,
  work_phone text,
  email text,
  website text,
  address text,
  linkedin text,
  tax_office text,
  tax_no text,
  avatar_url text,
  banner_url text,
  facebook text,
  twitter text,
  instagram text,
  theme text,
  theme_color text,
  bio text,
  social_order text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.username, p.full_name, p.company, p.title, p.mobile, p.work_phone,
    p.email, p.website, p.address, p.linkedin, p.tax_office, p.tax_no,
    p.avatar_url, p.banner_url, p.facebook, p.twitter, p.instagram,
    p.theme, p.theme_color, p.bio, p.social_order
  from public.profiles as p
  where p.username = lower(trim(p_username))
  limit 1;
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
       'linkedin', 'instagram', 'twitter', 'facebook', 'whatsapp'
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

revoke all on function public.get_public_profile(text) from public;
revoke all on function public.record_profile_view(text) from public;
revoke all on function public.record_link_click(text, text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated;
grant execute on function public.record_profile_view(text) to anon, authenticated;
grant execute on function public.record_link_click(text, text) to anon, authenticated;

drop policy if exists profiles_owner_select on public.profiles;
create policy profiles_owner_select on public.profiles
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists profiles_owner_insert on public.profiles;
create policy profiles_owner_insert on public.profiles
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists profiles_owner_update on public.profiles;
create policy profiles_owner_update on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists profiles_owner_delete on public.profiles;
create policy profiles_owner_delete on public.profiles
  for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists profile_views_owner_select on public.profile_views;
create policy profile_views_owner_select on public.profile_views
  for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.username = profile_views.username
      and p.user_id = (select auth.uid())
  ));

drop policy if exists link_clicks_owner_select on public.link_clicks;
create policy link_clicks_owner_select on public.link_clicks
  for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.username = link_clicks.username
      and p.user_id = (select auth.uid())
  ));

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profile_views'::regclass
      and conname = 'profile_views_username_fkey'
  ) then
    alter table public.profile_views
      add constraint profile_views_username_fkey
      foreign key (username) references public.profiles(username)
      on update cascade on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.link_clicks'::regclass
      and conname = 'link_clicks_username_fkey'
  ) then
    alter table public.link_clicks
      add constraint link_clicks_username_fkey
      foreign key (username) references public.profiles(username)
      on update cascade on delete cascade;
  end if;
end
$$;

create index if not exists link_clicks_username_clicked_at_idx
  on public.link_clicks (username, clicked_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'Avatars', 'Avatars', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists avatars_owner_insert on storage.objects;
create policy avatars_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'Avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_owner_update on storage.objects;
create policy avatars_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'Avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'Avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_owner_delete on storage.objects;
create policy avatars_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'Avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

commit;
