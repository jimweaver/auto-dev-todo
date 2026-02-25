import { describe, expect, it } from 'vitest';
import type { Logger } from '../../src/lib/logger';
import { createLocalStorageAdapter } from '../../src/lib/storage';

interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
}

/**
 * Create a logger that captures log entries for assertions.
 */
const createCapturingLogger = (): { logger: Logger; entries: LogEntry[] } => {
  const entries: LogEntry[] = [];

  return {
    entries,
    logger: {
      info: (message, context) => {
        entries.push({ level: 'info', message, context });
      },
      warn: (message, context) => {
        entries.push({ level: 'warn', message, context });
      },
      error: (message, context) => {
        entries.push({ level: 'error', message, context });
      }
    }
  };
};

/**
 * Fake Storage implementation with configurable behavior.
 */
class FakeStorage implements Storage {
  private store = new Map<string, string>();

  /**
   * Return the number of stored keys.
   */
  get length(): number {
    return this.store.size;
  }

  /**
   * Clear all stored keys.
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Retrieve a stored value by key.
   */
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  /**
   * Return the key at the specified index.
   */
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  /**
   * Remove a stored value by key.
   */
  removeItem(key: string): void {
    this.store.delete(key);
  }

  /**
   * Persist a value by key.
   */
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

/**
 * Storage implementation that throws on getItem.
 */
class ThrowingGetStorage extends FakeStorage {
  /**
   * Retrieve a stored value by key and throw.
   */
  getItem(): string | null {
    throw new Error('getItem failed');
  }
}

/**
 * Storage implementation that throws on setItem.
 */
class ThrowingSetStorage extends FakeStorage {
  /**
   * Persist a value by key and throw.
   */
  setItem(): void {
    throw new Error('setItem failed');
  }
}

describe('storage adapter', () => {
  it('returns an empty list when storage is unavailable', () => {
    const { logger, entries } = createCapturingLogger();
    const adapter = createLocalStorageAdapter(() => null, logger);

    const result = adapter.loadTodos();

    expect(result).toEqual([]);
    expect(entries.some((entry) => entry.level === 'warn')).toBe(true);
  });

  it('handles invalid JSON gracefully', () => {
    const storage = new FakeStorage();
    storage.setItem('todo-items', '{not-json}');

    const { logger, entries } = createCapturingLogger();
    const adapter = createLocalStorageAdapter(() => storage, logger);

    const result = adapter.loadTodos();

    expect(result).toEqual([]);
    expect(entries.some((entry) => entry.level === 'error')).toBe(true);
  });

  it('drops invalid todo entries while keeping valid ones', () => {
    const storage = new FakeStorage();
    storage.setItem(
      'todo-items',
      JSON.stringify([
        { id: '1', text: 'Valid', completed: false },
        { id: '2', text: 'Missing completed' }
      ])
    );

    const { logger, entries } = createCapturingLogger();
    const adapter = createLocalStorageAdapter(() => storage, logger);

    const result = adapter.loadTodos();

    expect(result).toHaveLength(1);
    expect(result[0]?.text).toBe('Valid');
    expect(entries.some((entry) => entry.level === 'warn')).toBe(true);
  });

  it('logs errors when storage throws on getItem', () => {
    const storage = new ThrowingGetStorage();
    const { logger, entries } = createCapturingLogger();
    const adapter = createLocalStorageAdapter(() => storage, logger);

    const result = adapter.loadTodos();

    expect(result).toEqual([]);
    expect(entries.some((entry) => entry.level === 'error')).toBe(true);
  });

  it('logs errors when storage throws on setItem', () => {
    const storage = new ThrowingSetStorage();
    const { logger, entries } = createCapturingLogger();
    const adapter = createLocalStorageAdapter(() => storage, logger);

    expect(() => adapter.saveTodos([])).not.toThrow();
    expect(entries.some((entry) => entry.level === 'error')).toBe(true);
  });
});
