// Registers @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
// on Vitest's expect.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

// jsdom runs on an opaque origin (about:blank), so its `localStorage` is an
// empty stub with no Storage methods. Auth/tokens read and write localStorage,
// so install a real in-memory implementation and reset it between tests.
class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
  key(index) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  get length() {
    return this.store.size;
  }
}

const memoryStorage = new MemoryStorage();
Object.defineProperty(window, 'localStorage', { value: memoryStorage, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage, configurable: true });

afterEach(() => {
  memoryStorage.clear();
});
