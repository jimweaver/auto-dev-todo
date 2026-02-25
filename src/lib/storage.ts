import type { Todo } from '../types/todo';
import type { Logger } from './logger';
import { serializeError } from './logger';

/**
 * Storage adapter interface for Todo persistence.
 */
export interface StorageAdapter {
  loadTodos(): Todo[];
  saveTodos(todos: Todo[]): void;
}

const STORAGE_KEY = 'todo-items';

/**
 * Type guard for Todo items loaded from storage.
 */
const isTodo = (value: unknown): value is Todo => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.text === 'string' &&
    typeof record.completed === 'boolean'
  );
};

/**
 * Validate and sanitize todos loaded from storage.
 */
const sanitizeTodos = (value: unknown, logger: Logger): Todo[] => {
  if (!Array.isArray(value)) {
    logger.warn('Stored todos were not an array', { valueType: typeof value });
    return [];
  }

  const validTodos = value.filter(isTodo);
  if (validTodos.length !== value.length) {
    logger.warn('Some stored todos were invalid and were dropped', {
      total: value.length,
      valid: validTodos.length
    });
  }

  return validTodos;
};

/**
 * Create a storage adapter backed by browser localStorage.
 */
export const createLocalStorageAdapter = (
  getStorage: () => Storage | null,
  logger: Logger
): StorageAdapter => ({
  /**
   * Load todos from localStorage.
   */
  loadTodos(): Todo[] {
    const storage = getStorage();
    if (!storage) {
      logger.warn('Local storage is unavailable', { reason: 'storage-null' });
      return [];
    }

    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed: unknown = JSON.parse(raw);
      return sanitizeTodos(parsed, logger);
    } catch (error) {
      logger.error('Failed to load todos from storage', {
        error: serializeError(error)
      });
      return [];
    }
  },
  /**
   * Save todos to localStorage.
   */
  saveTodos(todos: Todo[]): void {
    const storage = getStorage();
    if (!storage) {
      logger.warn('Local storage is unavailable', { reason: 'storage-null' });
      return;
    }

    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      logger.error('Failed to save todos to storage', {
        error: serializeError(error)
      });
    }
  }
});
