import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { UpcomingCheckin } from '@RealEstate/types';
import UpcomingCheckins from './UpcomingCheckins';

const makeCheckins = (n: number): UpcomingCheckin[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `r${i}`,
    guestName: `Guest ${i}`,
    propertyName: 'Apt. Jardines',
    checkIn: '2026-06-17',
    nights: 4,
    channel: 'AIRBNB' as const,
  }));

describe('UpcomingCheckins', () => {
  it('renders every check-in (all rows present, panel scrolls the overflow)', () => {
    render(<UpcomingCheckins checkins={makeCheckins(15)} />);
    expect(screen.getByText('Guest 0')).toBeInTheDocument();
    expect(screen.getByText('Guest 14')).toBeInTheDocument();
    expect(screen.getAllByText(/^Guest \d+$/)).toHaveLength(15);
  });

  it('shows the empty state when there are no check-ins', () => {
    render(<UpcomingCheckins checkins={[]} />);
    expect(screen.getByText(/no.*check/i)).toBeInTheDocument();
  });
});
