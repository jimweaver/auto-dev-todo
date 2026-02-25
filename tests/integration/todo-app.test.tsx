import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoApp from '../../src/components/TodoApp';
import type { StorageAdapter } from '../../src/lib/storage';
import { createLocalStorageAdapter } from '../../src/lib/storage';
import { createNoopLogger } from '../../src/lib/logger';
import type { Todo } from '../../src/types/todo';

/**
 * In-memory storage adapter used for integration tests.
 */
const createMemoryAdapter = (): StorageAdapter => {
  let state: Todo[] = [];

  return {
    /**
     * Load todos from memory.
     */
    loadTodos: () => state,
    /**
     * Save todos to memory.
     */
    saveTodos: (todos) => {
      state = [...todos];
    }
  };
};

/**
 * Minimal fake Storage implementation for localStorage adapter tests.
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
 * Render the Todo app with an optional storage adapter.
 */
const renderTodoApp = (storageAdapter?: StorageAdapter) => {
  return render(
    <TodoApp storage={storageAdapter ?? createMemoryAdapter()} logger={createNoopLogger()} />
  );
};

describe('TodoApp integration', () => {
  it('adds a todo on Enter', async () => {
    const user = userEvent.setup();
    renderTodoApp();

    const input = screen.getByLabelText(/add a todo/i);
    await user.type(input, 'Buy milk{enter}');

    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });

  it('toggles completion state', async () => {
    const user = userEvent.setup();
    renderTodoApp();

    const input = screen.getByLabelText(/add a todo/i);
    await user.type(input, 'Toggle me{enter}');

    const checkbox = screen.getByRole('checkbox', { name: /mark toggle me as complete/i });
    await user.click(checkbox);

    const listItem = screen.getByText('Toggle me').closest('li');
    expect(listItem).toHaveAttribute('data-completed', 'true');
  });

  it('deletes a todo', async () => {
    const user = userEvent.setup();
    renderTodoApp();

    const input = screen.getByLabelText(/add a todo/i);
    await user.type(input, 'Delete me{enter}');

    const deleteButton = screen.getByRole('button', { name: /delete delete me/i });
    await user.click(deleteButton);

    expect(screen.queryByText('Delete me')).not.toBeInTheDocument();
  });

  it('filters active and completed todos', async () => {
    const user = userEvent.setup();
    renderTodoApp();

    const input = screen.getByLabelText(/add a todo/i);
    await user.type(input, 'Task one{enter}Task two{enter}');

    const checkbox = screen.getByRole('checkbox', { name: /mark task one as complete/i });
    await user.click(checkbox);

    await user.click(screen.getByRole('button', { name: /active/i }));
    expect(screen.queryByText('Task one')).not.toBeInTheDocument();
    expect(screen.getByText('Task two')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /completed/i }));
    expect(screen.getByText('Task one')).toBeInTheDocument();
    expect(screen.queryByText('Task two')).not.toBeInTheDocument();
  });

  it('persists todos with localStorage round-trip', async () => {
    const user = userEvent.setup();
    const storage = new FakeStorage();
    const logger = createNoopLogger();
    const adapter = createLocalStorageAdapter(() => storage, logger);

    const { unmount } = render(
      <TodoApp storage={adapter} logger={logger} />
    );

    const input = screen.getByLabelText(/add a todo/i);
    await user.type(input, 'Persisted task{enter}');

    const persisted = storage.getItem('todo-items');
    expect(persisted).not.toBeNull();
    expect(persisted ?? '').toContain('Persisted task');

    unmount();

    render(<TodoApp storage={adapter} logger={logger} />);

    expect(await screen.findByText('Persisted task')).toBeInTheDocument();
  });
});
