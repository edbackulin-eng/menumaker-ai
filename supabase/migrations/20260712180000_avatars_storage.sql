-- Public Storage bucket for profile avatars (Stage 8), unlike the private
-- `menu-uploads` bucket (Stage 7). Avatars are low-sensitivity images shown
-- in plain <img> tags across the UI (header, dropdowns) and, eventually, on
-- future public menu pages ("menu by <name>") — a public bucket lets those
-- render via a stable public URL with no signed-URL generation on every
-- request. Path convention: `{user_id}/avatar.{ext}` (upsert on re-upload,
-- so a user only ever has one avatar object).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB, matches PROFILE_CONFIG.maxAvatarSizeBytes (src/config/profile.ts) — keep in sync
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public bucket => reads bypass RLS via the public URL endpoint by design;
-- writes still go through the authenticated Storage API and need explicit
-- policies, same own-folder pattern as menu-uploads (20260712090000).
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete_own_or_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
