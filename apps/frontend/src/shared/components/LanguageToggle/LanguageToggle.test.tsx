import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Language } from '@RealEstate/types';

const setLanguage = vi.fn();
vi.mock('../../i18n/LanguageContext', () => ({
  useLanguage: () => ({ language: Language.EN, setLanguage }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import LanguageToggle from './LanguageToggle';

beforeEach(() => vi.clearAllMocks());

describe('LanguageToggle', () => {
  it('renders all three options with the current language active', () => {
    render(<LanguageToggle />);
    expect(screen.getByRole('button', { name: 'language.en' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'language.es' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'language.ca' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls setLanguage with the chosen language', async () => {
    render(<LanguageToggle />);
    await userEvent.click(screen.getByRole('button', { name: 'language.es' }));
    expect(setLanguage).toHaveBeenCalledWith(Language.ES);

    await userEvent.click(screen.getByRole('button', { name: 'language.ca' }));
    expect(setLanguage).toHaveBeenCalledWith(Language.CA);
  });
});
