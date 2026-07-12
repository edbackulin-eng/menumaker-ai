-- Stage 11 (Export): public Storage bucket for generated PDF/PNG/QR files,
-- distinct from both `menu-uploads` (private, Stage 7 — user's *source*
-- files) and `avatars` (public, Stage 8). Public because the whole point of
-- these files is to be handed to someone else (printed, posted, scanned) —
-- a signed URL that expires would break a QR code taped to a table the
-- moment the link goes stale.
-- Path convention: `{user_id}/{menu_id}/{export_type}.{ext}`, upsert on
-- re-export so re-generating doesn't accumulate stale copies under new
-- names.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-exports',
  'menu-exports',
  true,
  20971520, -- 20MB — generous headroom for a large multi-page PDF menu
  array['application/pdf', 'image/png']
)
on conflict (id) do nothing;

create policy "menu_exports_storage_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'menu-exports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "menu_exports_storage_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'menu-exports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "menu_exports_storage_delete_own_or_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'menu-exports'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
