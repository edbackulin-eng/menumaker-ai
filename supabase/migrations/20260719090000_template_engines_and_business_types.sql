-- Stage 3 foundation: promotes the layout engine out of the untyped
-- `config` blob into a constrained column, and gives templates a venue-type
-- axis so the Template step can offer tabs (restaurant / cafe / coffeehouse
-- / bar / bakery).
--
-- Nothing here changes how any existing menu renders. Every backfill below
-- reproduces exactly what resolveTemplateDefaults() already derives today,
-- and the three new jsonb columns default to NULL, which every resolver
-- reads as "this engine uses its own built-in values" — the same contract
-- the Stage 13 fields were given.

-- ---------------------------------------------------------------------------
-- menu_templates.engine
-- ---------------------------------------------------------------------------
-- Which render tree draws the menu. Previously `config->>'layoutEngine'`: a
-- free-form string inside a blob, with no constraint stopping a typo from
-- silently falling back to 'classic' forever. It decides which of three
-- component trios runs, so it earns a real column with a real CHECK.
--
-- The constraint lists engines Stage 3 will add (grid, classic-elegant,
-- editorial) alongside the two that exist, so shipping each engine is a
-- code+seed change with no constraint migration. A row naming an engine the
-- running code doesn't know yet still renders: isLayoutEngine() falls back
-- to 'classic', which handles any content shape.
alter table public.menu_templates
  add column engine text not null default 'classic'
    check (engine in ('classic', 'banner-two-column', 'grid', 'classic-elegant', 'editorial'));

-- Backfill from the blob that has been driving this until now. Only the
-- 'modern' row carries a layoutEngine key today, so this sets exactly one
-- row to 'banner-two-column' and leaves the other 11 at 'classic'.
update public.menu_templates
set engine = config->>'layoutEngine'
where config->>'layoutEngine' is not null
  and config->>'layoutEngine' in ('classic', 'banner-two-column', 'grid', 'classic-elegant', 'editorial');

-- `config.layoutEngine` is deliberately NOT dropped here. Until the code
-- that reads the new column is deployed and verified, the blob key is the
-- only thing keeping Modern rendering as Modern — removing both in one
-- migration would make a code rollback silently downgrade Modern to the
-- classic tree. A follow-up migration drops the key once this is confirmed.

-- ---------------------------------------------------------------------------
-- menu_templates.business_types
-- ---------------------------------------------------------------------------
-- Which venue-type tab(s) a template appears under. An array rather than a
-- scalar because the five style-led templates (Luxury/Modern/Minimal/
-- Elegant/Dark) genuinely suit every venue type — a scalar would force
-- either an arbitrary single assignment or duplicate rows.
alter table public.menu_templates
  add column business_types text[] not null default '{}';

-- Cuisine-led templates map to the venue type their name already implies;
-- pizza/sushi/burger are all sit-down restaurants for tab purposes. The
-- style-led five get all five types.
update public.menu_templates set business_types = '{cafe,coffeehouse}' where slug = 'coffee-shop';
update public.menu_templates set business_types = '{restaurant}' where slug in ('restaurant', 'pizza', 'sushi', 'burger');
update public.menu_templates set business_types = '{bakery}' where slug = 'bakery';
update public.menu_templates set business_types = '{bar}' where slug = 'bar';
update public.menu_templates set business_types = '{restaurant,cafe,coffeehouse,bar,bakery}'
where slug in ('luxury', 'modern', 'minimal', 'elegant', 'dark');

-- GIN, because every Template-step query is a containment test
-- (`business_types @> ARRAY[tab]`), which a btree cannot serve.
create index menu_templates_business_types_idx on public.menu_templates using gin (business_types);

-- ---------------------------------------------------------------------------
-- menu_templates.palette / .typography / .photo_policy
-- ---------------------------------------------------------------------------
-- Per-engine design inputs, kept out of `config` on purpose: `config` holds
-- the classic engine's fields (defaultAccentColorId, background,
-- categoryHeaderStyle, ...), and these hold the new engines' — different
-- shapes, different parsers, different zod schemas. Merging them would mean
-- one resolver picking two unrelated dictionaries out of one object.
--
-- NULL means "this engine uses its built-in defaults", which is why every
-- existing row can stay NULL and render byte-identically: Modern keeps
-- painting from MODERN_PALETTE, the classic engine keeps reading `config`.
alter table public.menu_templates add column palette jsonb;
alter table public.menu_templates add column typography jsonb;
alter table public.menu_templates add column photo_policy jsonb;

comment on column public.menu_templates.engine is
  'Which render tree draws this template (DOM/Satori/react-pdf trio). Mirrors MenuLayoutEngine in src/lib/utils/resolve-menu-style.ts.';
comment on column public.menu_templates.business_types is
  'Venue-type tabs this template appears under on the Template wizard step. Array: style-led templates suit every type.';
comment on column public.menu_templates.palette is
  'Engine-specific color set. NULL = engine uses its built-in palette.';
comment on column public.menu_templates.typography is
  'Engine-specific type scale/pairing. NULL = engine uses its built-in defaults.';
comment on column public.menu_templates.photo_policy is
  'Engine-specific dish-photo treatment (size, aspect, whether photos render at all). NULL = engine default.';

-- ---------------------------------------------------------------------------
-- menus.business_type
-- ---------------------------------------------------------------------------
-- The venue type is a property of the *menu*, not of the template it
-- happens to use — the same restaurant keeps being a restaurant after
-- switching templates.
--
-- Deliberately nullable with no default: NULL means "the user hasn't
-- reached the Template step yet", which is a real state, not a missing
-- value. The photo-search suffix reads exactly this — no type yet means
-- search without a style suffix, rather than silently pretending every new
-- menu is a restaurant. Defaulting to 'restaurant' would erase the
-- distinction between "chose restaurant" and "hasn't chosen".
alter table public.menus
  add column business_type text
    check (business_type in ('restaurant', 'cafe', 'coffeehouse', 'bar', 'bakery'));

comment on column public.menus.business_type is
  'Venue type, chosen on the Template wizard step. NULL = not chosen yet (photo search then runs without a style suffix).';
