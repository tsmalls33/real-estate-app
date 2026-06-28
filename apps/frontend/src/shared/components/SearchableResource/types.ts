import type { ReactNode } from 'react';

export interface FilterOption {
  /** Value sent to the API for this option (e.g. a PropertyStatus). */
  value: string;
  /** i18n key for the chip label. */
  labelKey: string;
}

export interface FilterGroup {
  /** Query-string / API param this group writes (e.g. 'status'). */
  param: string;
  /** i18n key for the implicit "All" chip, which clears the param. */
  allLabelKey: string;
  options: FilterOption[];
}

export interface ResourceSearchConfig {
  /** Query-string / API param for the free-text search (e.g. 'q'). */
  searchParam: string;
  searchPlaceholderKey: string;
  /** i18n key for the Reset control. */
  resetLabelKey: string;
  /** Page size this resource fetches with. */
  pageSize: number;
  filterGroups: FilterGroup[];
}

/** Current bar state: the search text plus each group's active option value ('' = All). */
export type SearchFilterValue = { q: string } & Record<string, string>;

/** Query handed to the fetcher: search + filter params + pagination. */
export type ResourceQuery = {
  q?: string;
  page?: number;
  limit?: number;
} & Record<string, string | number | undefined>;

export interface SearchableResourceState<T> {
  items: T[];
  total: number;
  loading: boolean;
  error: string | null;
}

export interface SearchableResourceProps<T> {
  config: ResourceSearchConfig;
  fetcher: (query: ResourceQuery) => Promise<{ items: T[]; total: number }>;
  /** Optional header rendered above the bar; receives the live total (null while loading or on error). */
  header?: (total: number | null) => ReactNode;
  children: (state: SearchableResourceState<T>) => ReactNode;
}
