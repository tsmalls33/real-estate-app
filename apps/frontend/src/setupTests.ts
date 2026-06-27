// Registers @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
// on Vitest's expect.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

// Initialize i18next so components that use useTranslation don't warn.
import './shared/i18n/i18n';

// jsdom runs on an opaque origin (about:blank), so its `localStorage` is an
// empty stub with no Storage methods. Auth/tokens read and write localStorage,
// so install a real in-memory implementation and reset it between tests.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  get length(): number {
    return this.store.size;
  }
}

const memoryStorage = new MemoryStorage();
Object.defineProperty(window, 'localStorage', { value: memoryStorage, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage, configurable: true });

afterEach(() => {
  memoryStorage.clear();
});
