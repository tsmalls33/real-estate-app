import { describe, it, expect } from 'vitest';
import { initials } from './initials';

describe('initials', () => {
  it('combines first and last initial, uppercased', () => {
    expect(initials('Ada', 'Lovelace', 'a@x.com')).toBe('AL');
  });

  it('uses whichever name part is present', () => {
    expect(initials('Ada', null, 'a@x.com')).toBe('A');
    expect(initials(null, 'Lovelace', 'a@x.com')).toBe('L');
  });

  it('falls back to the first two email characters when no name', () => {
    expect(initials(null, null, 'ada@x.com')).toBe('AD');
  });

  it('ignores whitespace-only name parts', () => {
    expect(initials('  ', '  ', 'ada@x.com')).toBe('AD');
  });

  it('returns ? when neither name nor email is available', () => {
    expect(initials()).toBe('?');
  });
});