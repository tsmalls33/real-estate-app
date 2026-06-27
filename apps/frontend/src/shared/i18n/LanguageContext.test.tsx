import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Language } from '@RealEstate/types';

const { changeLanguage } = vi.hoisted(() => {
  const changeLanguage = vi.fn();
  return { changeLanguage };
});
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { changeLanguage } }),
}));

vi.mock('../api/services', () => ({
  userApi: { updateLanguage: vi.fn() },
}));

vi.mock('../auth/tokens', () => ({
  getAccessToken: vi.fn(() => null),
}));

import { LanguageProvider, useLanguage } from './LanguageContext';

function Consumer() {
  const { language, setLanguage } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <button onClick={() => setLanguage(Language.ES)}>Set ES</button>
      <button onClick={() => setLanguage(Language.EN)}>Set EN</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('LanguageContext', () => {
  it('uses provided preferredLanguage', () => {
    render(
      <LanguageProvider preferredLanguage={Language.ES}>
        <Consumer />
      </LanguageProvider>,
    );
    expect(screen.getByTestId('lang')).toHaveTextContent(Language.ES);
  });

  it('falls back to localStorage when no preferredLanguage', () => {
    localStorage.setItem('preferred-language', Language.ES);
    render(
      <LanguageProvider preferredLanguage={null}>
        <Consumer />
      </LanguageProvider>,
    );
    expect(screen.getByTestId('lang')).toHaveTextContent(Language.ES);
  });

  it('restores a stored Catalan preference without overwriting it', () => {
    localStorage.setItem('preferred-language', Language.CA);
    render(
      <LanguageProvider preferredLanguage={null}>
        <Consumer />
      </LanguageProvider>,
    );
    expect(screen.getByTestId('lang')).toHaveTextContent(Language.CA);
    expect(localStorage.getItem('preferred-language')).toBe(Language.CA);
  });

  it('defaults to EN when nothing is stored', () => {
    render(
      <LanguageProvider preferredLanguage={null}>
        <Consumer />
      </LanguageProvider>,
    );
    expect(screen.getByTestId('lang')).toHaveTextContent(Language.EN);
  });

  it('setLanguage updates state and localStorage', async () => {
    render(
      <LanguageProvider preferredLanguage={Language.EN}>
        <Consumer />
      </LanguageProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Set ES' }));
    expect(screen.getByTestId('lang')).toHaveTextContent(Language.ES);
    expect(localStorage.getItem('preferred-language')).toBe(Language.ES);
  });

  it('calls i18n.changeLanguage on mount with resolved language', () => {
    render(
      <LanguageProvider preferredLanguage={Language.ES}>
        <Consumer />
      </LanguageProvider>,
    );
    expect(changeLanguage).toHaveBeenCalledWith('es');
  });

  it('calls i18n.changeLanguage on mount from localStorage fallback', () => {
    localStorage.setItem('preferred-language', Language.ES);
    render(
      <LanguageProvider preferredLanguage={null}>
        <Consumer />
      </LanguageProvider>,
    );
    expect(changeLanguage).toHaveBeenCalledWith('es');
  });

  it('setLanguage calls i18n.changeLanguage with the new language', async () => {
    changeLanguage.mockClear();
    render(
      <LanguageProvider preferredLanguage={Language.EN}>
        <Consumer />
      </LanguageProvider>,
    );
    changeLanguage.mockClear();
    await userEvent.click(screen.getByRole('button', { name: 'Set ES' }));
    expect(changeLanguage).toHaveBeenCalledWith('es');
  });
});
