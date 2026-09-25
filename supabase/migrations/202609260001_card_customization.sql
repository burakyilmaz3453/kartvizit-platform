begin;
alter table public.profiles add column if not exists icon_config jsonb not null default '{}'::jsonb;
drop function if exists public.get_public_profile(text);
create function public.get_public_profile(p_username text)
returns table (username text,full_name text,company text,title text,mobile text,work_phone text,email text,website text,address text,linkedin text,tax_office text,tax_no text,avatar_url text,banner_url text,facebook text,twitter text,instagram text,theme text,theme_color text,bio text,social_order text,icon_config jsonb)
language sql stable security definer set search_path=''
as $$ select p.username,p.full_name,p.company,p.title,p.mobile,p.work_phone,p.email,p.website,p.address,p.linkedin,p.tax_office,p.tax_no,p.avatar_url,p.banner_url,p.facebook,p.twitter,p.instagram,p.theme,p.theme_color,p.bio,p.social_order,p.icon_config from public.profiles p where p.username=lower(trim(p_username)) limit 1 $$;
revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon,authenticated;
commit;
