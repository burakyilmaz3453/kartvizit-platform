begin;

drop policy if exists "Enable delete for users based on user_id" on public.profiles;
drop policy if exists "Enable insert for authenticated users only" on public.profiles;
drop policy if exists "Enable insert for users based on user_id" on public.profiles;
drop policy if exists "Enable read access for all users" on public.profiles;
drop policy if exists profiles_public_read on public.profiles;

drop policy if exists "Herkes güncelleyebilir" on public.profile_views;
drop policy if exists "Herkes okuyabilir" on public.profile_views;
drop policy if exists "Herkes yazabilir" on public.profile_views;
drop policy if exists profile_views_anon_insert on public.profile_views;
drop policy if exists profile_views_anon_select on public.profile_views;
drop policy if exists profile_views_anon_update on public.profile_views;
drop policy if exists profile_views_public_upsert on public.profile_views;

drop policy if exists "Herkes yazabilir" on public.link_clicks;
drop policy if exists "Kullanıcı kendi verilerini okur" on public.link_clicks;
drop policy if exists link_clicks_anon_insert on public.link_clicks;
drop policy if exists link_clicks_anon_select on public.link_clicks;
drop policy if exists link_clicks_public_insert on public.link_clicks;

drop policy if exists "Upload avatars 2 h0za56_0" on storage.objects;
drop policy if exists "Upload avatars 2 h0za56_1" on storage.objects;
drop policy if exists "Upload avatars h0za56_0" on storage.objects;

revoke all on table public.profiles from anon;
revoke all on table public.profile_views from anon;
revoke all on table public.link_clicks from anon;
revoke insert, update, delete on table public.profile_views from authenticated;
revoke insert, update, delete on table public.link_clicks from authenticated;

revoke all on function public.handle_new_user() from public, anon, authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;
grant select on table public.profile_views to authenticated;
grant select on table public.link_clicks to authenticated;

alter table public.profile_views
  drop constraint if exists profile_views_username_key;

commit;
