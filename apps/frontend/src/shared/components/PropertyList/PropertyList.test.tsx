import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PropertyStatus } from '@RealEstate/types';
import { makeProperty } from '../../../test-utils/factories';
import { formatPrice } from '../../format/price';
import PropertyList from './PropertyList';

describe('PropertyList', () => {
  it('renders admin cards with owner, formatted status and price', () => {
    const { container } = render(
      <PropertyList
        variant="admin"
        showOwner
        items={[
          makeProperty({
            propertyName: 'Sunny Villa',
            propertyAddress: '1 Ocean Rd',
            status: PropertyStatus.AVAILABLE_SALE,
            salePrice: 500000,
            owner: { id_user: 'o1', firstName: 'Jane', lastName: 'Smith', email: 'jane@acme.com' },
          }),
        ]}
      />,
    );

    expect(screen.getByText('Sunny Villa')).toBeInTheDocument();
    expect(screen.getByText('1 Ocean Rd')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('AVAILABLE SALE')).toBeInTheDocument();
    expect(screen.getByText(formatPrice(500000) as string)).toBeInTheDocument();
    expect(container.querySelector('[data-variant="admin"]')).toBeTruthy();
  });

  it('shows "Unassigned" when a property has no owner', () => {
    render(
      <PropertyList
        variant="admin"
        showOwner
        items={[makeProperty({ owner: null })]}
      />,
    );
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('uses the client variant class set', () => {
    const { container } = render(
      <PropertyList variant="client" items={[makeProperty()]} />,
    );
    expect(container.querySelector('[data-variant="client"]')).toBeTruthy();
    expect(container.querySelector('[data-variant="admin"]')).toBeNull();
  });

  it('renders the default empty label', () => {
    render(<PropertyList variant="admin" items={[]} />);
    expect(screen.getByText('No properties yet.')).toBeInTheDocument();
  });

  it('renders a custom empty label', () => {
    render(<PropertyList variant="client" items={[]} emptyLabel="Nothing here." />);
    expect(screen.getByText('Nothing here.')).toBeInTheDocument();
  });
});
