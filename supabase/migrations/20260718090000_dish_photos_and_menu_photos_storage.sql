-- Stage 2 (dish photos): a shared cache of dish-name -> photo lookups, so
-- "Margherita" is only ever sent to the Pexels API once for the whole
-- platform, not once per menu. This is the load-bearing piece that keeps
-- the search volume under Pexels' 200 req/hour ceiling (see the Stage 2
-- plan: search happens on Template, not Import, and this cache is what
-- makes repeat dish names free).
--
-- `provider` is carried on every row (not assumed to be 'pexels') because
-- PhotoProvider is designed to grow a second implementation later (e.g. AI
-- image generation) without a schema change — the cache key is
-- (provider, query_normalized), not query_normalized alone, so two
-- providers never collide on the same row.
--
-- Normalization ("Caesar Salad" / "caesar salad " / "Caesar salad" -> one
-- row) happens in application code (the only write path is the server-only
-- photo lookup service) before every read/write here — the check
-- constraint below is a defense-in-depth guard against that invariant
-- silently breaking, not the primary enforcement mechanism.
create table public.dish_photos (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  query_normalized text not null,
  photo_url text not null,
  thumb_url text not null,
  width integer,
  height integer,
  external_id text,
  attribution_name text,
  attribution_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dish_photos_query_normalized_check
    check (query_normalized = lower(btrim(query_normalized)) and query_normalized <> ''),
  unique (provider, query_normalized)
);

create trigger set_dish_photos_updated_at
  before update on public.dish_photos
  for each row
  execute function public.set_updated_at();

alter table public.dish_photos enable row level security;

-- Read: authenticated only (the wizard's Template step, the only caller,
-- always has a signed-in user by the time it reaches photo search — see
-- requireAuth() in the route). No anon policy: `/m/[slug]` reads the
-- already-resolved URL cached in `menus.content`, never this table
-- directly.
create policy "dish_photos_select_authenticated"
  on public.dish_photos for select
  to authenticated
  using (true);

-- Write: service_role only. A shared cache that any authenticated user
-- could INSERT/UPDATE into would let one user's request poison the photo
-- another user's menu shows for the same dish name — every write goes
-- through the server-only lookup service using createServiceClient(),
-- never the user's session-scoped client.
grant select on public.dish_photos to authenticated;
grant all on public.dish_photos to service_role;

-- Public Storage bucket for user-uploaded photo replacements (Stage 2).
-- Distinct from `menu-uploads` (private, source files) and `menu-exports`
-- (public, generated PDF/PNG/QR) — this holds only the photos a user
-- explicitly picks to override a dish's auto-matched Pexels photo.
-- Pexels-sourced photos never touch this bucket (or any bucket): the app
-- stores and hotlinks the Pexels CDN URL directly, cached in
-- `dish_photos.photo_url` and `menus.content`.
--
-- Public for the same reason as `menu-exports` (20260715090000): the
-- generated menu at `/m/[slug]` is shown to anonymous visitors, and a
-- signed URL that expires would silently break a photo on a client's live
-- menu page. Path convention: `{user_id}/{menu_id}/{item_id}.{ext}`.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-photos',
  'menu-photos',
  true,
  5242880, -- 5MB — a single dish photo, not a document
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public bucket => reads bypass RLS via the public URL endpoint by design
-- (see avatars_storage.sql, 20260712180000); writes still go through the
-- authenticated Storage API and need explicit policies.
create policy "menu_photos_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'menu-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "menu_photos_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'menu-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "menu_photos_delete_own_or_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'menu-photos'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
