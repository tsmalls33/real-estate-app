# Property search + status filters — design

Issue #46. Branch off current work.

## Goal

Add a debounced search box and status filter chips to the admin properties list, with
filter state reflected in the URL. Build the search/filter machinery as a **reusable,
config-driven** unit so reservations/costs can adopt it later — without coupling it to any
entity's API shape or row rendering.

## Scope (this PR)

- Backend: `q` query param on `GET /properties` — case-insensitive `contains` on
  `propertyName` + `propertyAddress`.
- Frontend: generic `SearchableResource` container + `SearchFilterBar` UI, instantiated for
  properties via a config object.
- Search input (debounced 300ms) + single-select status chips: All / For sale / For rent /
  Under rental / Sold / Inactive.
- URL state: `q` and `status` reflected in the query string; survive reload.
- Reset chip shown when any filter is active.

## Out of scope (follow-ups)

- Fuzzy search (`pg_trgm` / search engine). This PR is substring `contains` only.
- `saleType` filtering — the chips map 1:1 to `PropertyStatus`; `saleType` is not used.
- Reservations / costs configs. We ship the generic code + the **properties** config only.
- Saved searches; client-side search.

## Architecture

Three layers, concerns split so the generic code never learns any entity's shape:

```
Page (Dashboard.tsx)
  └─ <SearchableResource config={propertiesSearchConfig} fetcher={fetchProperties}>
       {(items) => <PropertyList items={items} variant="admin" showOwner />}
     </SearchableResource>
       └─ renders <SearchFilterBar config={config} value={...} onChange={...} />
```

### `SearchableResource<T>` — generic container

`shared/components/SearchableResource/SearchableResource.tsx`

- Owns URL state via `useSearchParams` (reads/writes `q`, each filter group's param, `page`).
- Debounces `q` (300ms) before it hits the fetcher; filter chips apply immediately.
- Assembles the query (`q` + filter params + `page` + `limit: config.pageSize`) and calls
  `fetcher(query)`; tracks `loading` / `error` / data.
- Renders `<SearchFilterBar>` + (loading | error | `children(items, total)`) + the pagination
  controls. Pagination moves here from `Dashboard.tsx` (port `renderPages` + prev/next),
  computing `totalPages` from `total` and `config.pageSize`, so it reacts to filtered totals.
- **Knows nothing about properties** — no endpoints, columns, or DTOs.

Props:

```ts
interface SearchableResourceProps<T> {
  config: ResourceSearchConfig;
  fetcher: (query: ResourceQuery) => Promise<{ items: T[]; total: number }>;
  children: (items: T[], total: number) => React.ReactNode;
}

type ResourceQuery = {
  q?: string;
  page?: number;
  limit?: number;
} & Record<string, string | number | undefined>; // filter-group params, e.g. { status: 'SOLD' }
```

The container is generic over `T` (the row type). Because the test runner's tsx loader
treats `<T>(` as JSX, write the generic arrow as `<T,>(…)` (trailing comma).

### `ResourceSearchConfig` — the generic schema

Expresses **arbitrary** search + filter-group → param mappings. Generic in the *type*;
the properties *instance* contains only what #46 ships.

```ts
interface ResourceSearchConfig {
  searchParam: string;            // 'q'
  searchPlaceholderKey: string;   // i18n key
  pageSize: number;               // page size this resource fetches with (properties: 12)
  filterGroups: FilterGroup[];
}

interface FilterGroup {
  // single-select segmented control; one active option at a time
  param: string;                  // URL/query key this group writes, e.g. 'status'
  options: FilterOption[];        // excludes the implicit "All" (= clear param)
  allLabelKey: string;            // i18n key for the All chip
}

interface FilterOption {
  value: string;                  // enum value sent to the API, e.g. 'AVAILABLE_SALE'
  labelKey: string;               // i18n key
}
```

### Properties config instance

`admin/pages/dashboardSearchConfig.ts` (or co-located):

```ts
export const propertiesSearchConfig: ResourceSearchConfig = {
  searchParam: 'q',
  searchPlaceholderKey: 'admin.dashboard.searchPlaceholder',
  pageSize: 12,
  filterGroups: [{
    param: 'status',
    allLabelKey: 'admin.dashboard.filters.all',
    options: [
      { value: 'AVAILABLE_SALE',   labelKey: 'admin.dashboard.filters.forSale' },
      { value: 'AVAILABLE_RENTAL', labelKey: 'admin.dashboard.filters.forRent' },
      { value: 'UNDER_RENTAL',     labelKey: 'admin.dashboard.filters.underRental' },
      { value: 'SOLD',             labelKey: 'admin.dashboard.filters.sold' },
      { value: 'INACTIVE',         labelKey: 'admin.dashboard.filters.inactive' },
    ],
  }],
};
```

### `SearchFilterBar` — config-driven UI

`shared/components/SearchableResource/SearchFilterBar.tsx`

- Renders the search input + one segmented chip row per `filterGroup` (here: one row).
- Controlled: `value` (current `q` + active filter values) in, `onChange` out. No URL/fetch
  logic — that's the container's job.
- "All" chip = the cleared state for a group; a Reset chip clears `q` + all groups, shown
  only when something is active.
- Styling: Tailwind + design tokens, matching the existing pagination/admin look in
  `Dashboard.tsx`. Responsive per `frontend-edits` rules (chips wrap on `max-card:`).

## URL state & the page-reset rule

- Keys: `q`, `status` (and `page` from the existing pagination work).
- Empty/`All`/cleared values are **deleted** from the query string (matches the existing
  `page<=1` delete convention) so the URL stays clean.
- **Changing `q` or any filter resets pagination**: `SearchableResource` deletes `page`
  whenever a search/filter write happens. Centralized here so no page can forget it.
  (Without this, filtering while on page 3 fetches page 3 of a 1-page result → empty grid.)

## Backend

`GET /properties` — add `q`:

- `dto/get-properties-query-params.ts`: add
  ```ts
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  q?: string;
  ```
- `property.service.findAll`: forward `query.q` into the `propertyRepository.findAll({ … })`
  call (add `q` to its filter object, alongside `status`, `scope`, etc.).
- `property.repository.findAll`: accept `q?: string` in its filter param; when present, add to
  the Prisma `where`:
  ```ts
  ...(q && {
    OR: [
      { propertyName:    { contains: q, mode: 'insensitive' } },
      { propertyAddress: { contains: q, mode: 'insensitive' } },
    ],
  }),
  ```
  `OR` is a sibling key in the `where`, so it ANDs with `isDeleted: false`, `status`, and
  `tenantFilter(scope)` — it narrows the already-scoped set, never replaces it. Scope behaves
  per role with zero extra work: SUPERADMIN's scope is `{ type: 'ALL' }` → `tenantFilter`
  returns `{}` (no-op) → **search spans all tenants**; ADMIN/EMPLOYEE get `id_tenant` injected
  → search is confined to their tenant. The same `where` feeds `findMany` and `count`, so
  paginated totals stay correct for each scope.

## API client

`shared/api/services.ts` — widen `propertyApi.list` param type to
`{ q?: string; status?: string; saleType?: string; page?: number; limit?: number }`.
The existing querystring builder already serializes any keys, so only the type widens.

The page-level `fetchProperties` adapter normalizes the response to the container's contract.
The container already injects `limit` (= `config.pageSize`), so the adapter just maps the
response shape:

```ts
const fetchProperties = (query: ResourceQuery) =>
  propertyApi.list(query)
    .then(({ properties, total }) => ({ items: properties, total }));
```

## Dashboard wiring

`Dashboard.tsx` drops its hand-rolled `useEffect` fetch and `page` parsing in favour of
`<SearchableResource>`, supplying `propertiesSearchConfig`, `fetchProperties`, and a render
fn returning `<PropertyList>`. Pagination controls move into `SearchableResource` (it owns
`total` + `page` now) so they react to filtered totals. `PropertyList` is untouched.

## i18n

All user-facing strings go through `react-i18next`. Three locales, each a single
`common.json`: `shared/i18n/locales/{en,es,ca}/common.json` (registered in `i18n.ts`).
Keys are added to **all three** under `admin.dashboard`, matching the existing nesting:

| Key (`admin.dashboard.…`)      | en                  | es                    | ca                   |
|--------------------------------|---------------------|-----------------------|----------------------|
| `searchPlaceholder`            | Search properties…  | Buscar propiedades…   | Cerca propietats…    |
| `filters.all`                  | All                 | Todas                 | Totes                |
| `filters.forSale`              | For sale            | En venta              | En venda             |
| `filters.forRent`              | For rent            | En alquiler           | En lloguer           |
| `filters.underRental`          | Under rental        | Alquilada             | Llogada              |
| `filters.sold`                 | Sold                | Vendida               | Venuda               |
| `filters.inactive`             | Inactive            | Inactiva              | Inactiva             |
| `filters.reset`                | Reset               | Restablecer           | Restableix           |

No hardcoded UI strings in `SearchFilterBar`/`SearchableResource`; the config carries i18n
**keys** (not literals), resolved with `t()` at render. es/ca strings above are my best
effort — worth a native sanity-check, but they ship complete (no missing-key fallbacks to en).

## Testing

- **Backend** (`property.service.spec.ts` / api-spec): `q` builds the case-insensitive `OR`
  and stays within tenant scope; absent `q` → no `OR`.
- **Frontend** (Vitest + RTL, `realestate-frontend-tests` skill):
  - `SearchFilterBar`: renders chips from config; clicking a chip fires `onChange` with that
    group's value; Reset appears only when active and clears.
  - `SearchableResource`: debounces `q` before fetching; chip change deletes `page`; reflects
    state to/from the URL (`MemoryRouter` initial entries); renders `children` with `items`.
  - `Dashboard`: typing searches, chip filters, refresh preserves state (mock `propertyApi`).

## Acceptance (from #46)

- Typing updates the URL after 300ms idle and re-fetches. ✓
- Selecting a chip updates the URL and the grid. ✓
- Refreshing preserves filter state. ✓

## Implementation notes (refinements made during the build)

These deviate from the sketches above; the code is authoritative.

- **UI:** chosen design is the V3 preview — section title on its own line, a single tab-style
  status row (active option gets an underline highlight, no separator bar) with a compact,
  fully-rounded **pill search** inline on the same row, Reset at the end. Previews:
  `previews/search-bar-options.html`, `previews/search-bar-options-v2.html` (gitignored).
- **Chips are toggle buttons, not ARIA tabs** — `<button aria-pressed>` in a group (single
  select), since there are no tabpanels. Cleaner for `jsx-a11y` and semantically accurate.
- **`SearchableResource` props** ended up as
  `{ config, fetcher, header?: (total) => ReactNode, children: (state) => ReactNode }` where
  `state = { items, total, loading, error }`. The page renders the body (loading / error /
  list / empty) so entity-specific copy stays out of the generic container; the optional
  `header` slot lets the page keep the role-based title **with the live total**. The container
  still owns URL state, 300 ms debounce, page-reset, fetch, and pagination.
- **`ResourceSearchConfig` gained `resetLabelKey`** so the Reset label is config-driven too —
  the generic bar owns zero entity strings.
- **i18n:** the pagination summary key moved from `admin.dashboard.paginationCount` to
  `common.paginationCount` (the generic container uses it); `admin.dashboard.filters.reset`
  added alongside `searchPlaceholder` + `filters.*`. All three locales (`en`/`es`/`ca`).
- **Empty state** unchanged — `PropertyList`'s own "no properties yet" (the container does not
  special-case empty), preserving existing Dashboard behaviour and tests.
