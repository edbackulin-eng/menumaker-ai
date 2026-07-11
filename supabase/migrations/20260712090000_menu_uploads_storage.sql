-- Private Storage bucket for original menu files uploaded during the Menu
-- Generator import flow (Stage 7). Not public — files are only ever read by
-- our own backend (service_role, which bypasses RLS) via signed URLs if/when
-- needed; the RLS policies below are defense-in-depth for the case a client
-- ever talks to Storage directly in a later stage, not the primary access
-- path today. Path convention: `{user_id}/{menu_id}/{filename}`.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-uploads',
  'menu-uploads',
  false,
  10485760, -- 10MB, matches MENU_GENERATOR_CONFIG.maxFileSizeBytes (src/config/menu-generator.ts) — keep in sync
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do nothing;

create policy "menu_uploads_select_own_or_admin"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'menu-uploads'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "menu_uploads_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'menu-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "menu_uploads_delete_own_or_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'menu-uploads'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- Marks the moment the user approved the AI-recognized content on the
-- Review step (Stage 7 wizard step 2 -> 3). Distinct from `status` (whose
-- enum is draft/processing/completed/failed — a general lifecycle signal
-- reused outside the wizard too) because "analyzed but not yet approved by
-- the user" and "approved, awaiting template choice" are both `status =
-- 'draft'` with non-empty `content`; without this column the wizard can't
-- tell those two steps apart after a page reload.
alter table public.menus
  add column content_confirmed_at timestamptz;
