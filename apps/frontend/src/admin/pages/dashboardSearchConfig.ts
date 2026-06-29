import { PropertyStatus } from '@RealEstate/types';
import type { ResourceSearchConfig } from '../../shared/components/SearchableResource/types';

// Properties is the first consumer of SearchableResource. The five status chips
// map 1:1 to PropertyStatus; saleType is intentionally not filtered here (#46).
export const propertiesSearchConfig: ResourceSearchConfig = {
  searchParam: 'q',
  searchPlaceholderKey: 'admin.dashboard.searchPlaceholder',
  resetLabelKey: 'admin.dashboard.filters.reset',
  pageSize: 12,
  filterGroups: [
    {
      param: 'status',
      allLabelKey: 'admin.dashboard.filters.all',
      options: [
        { value: PropertyStatus.AVAILABLE_SALE, labelKey: 'admin.dashboard.filters.forSale' },
        { value: PropertyStatus.AVAILABLE_RENTAL, labelKey: 'admin.dashboard.filters.forRent' },
        { value: PropertyStatus.UNDER_RENTAL, labelKey: 'admin.dashboard.filters.underRental' },
        { value: PropertyStatus.SOLD, labelKey: 'admin.dashboard.filters.sold' },
        { value: PropertyStatus.INACTIVE, labelKey: 'admin.dashboard.filters.inactive' },
      ],
    },
  ],
};
