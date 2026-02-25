'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Todo, TodoFilter } from '../types/todo';
import TodoFilterControls from './TodoFilter';
import TodoInput from './TodoInput';
import TodoItem from './TodoItem';
import type { Logger } from '../lib/logger';
import { createBrowserLogger, serializeError } from '../lib/logger';
import type { StorageAdapter } from '../lib/storage';
import { createLocalStorageAdapter } from '../lib/storage';

interface TodoAppProps {
  storage?: StorageAdapter;
  logger?: Logger;
  initialFilter?: TodoFilter;
}

const DEFAULT_FILTER: TodoFilter = 'all';

/**
 * Generate a unique identifier for a new Todo item.
 */
const createTodoId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * Top-level Todo application component.
 */
export default function TodoApp({
  storage,
  logger,
  initialFilter = DEFAULT_FILTER
}: TodoAppProps): JSX.Element {
  const resolvedLogger = useMemo<Logger>(
    () => logger ?? createBrowserLogger('TodoApp'),
    [logger]
  );
  const resolvedStorage = useMemo<StorageAdapter>(
    () =>
      storage ??
      createLocalStorageAdapter(
        () => (typeof window === 'undefined' ? null : window.localStorage),
        resolvedLogger
      ),
    [storage, resolvedLogger]
  );

  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>(initialFilter);
  const [inputValue, setInputValue] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  useEffect(() => {
    const loadedTodos = resolvedStorage.loadTodos();
    setTodos(loadedTodos);
    setHasLoaded(true);
  }, [resolvedStorage]);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    resolvedStorage.saveTodos(todos);
  }, [todos, hasLoaded, resolvedStorage]);

  /**
   * Add a new Todo if the input contains valid text.
   */
  const handleAddTodo = (value: string): void => {
    try {
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }

      setTodos((prev) => [
        ...prev,
        {
          id: createTodoId(),
          text: trimmed,
          completed: false
        }
      ]);
    } catch (error) {
      resolvedLogger.error('Failed to add todo', {
        error: serializeError(error)
      });
    }
  };

  /**
   * Handle submitting the current input value.
   */
  const handleSubmit = (): void => {
    try {
      handleAddTodo(inputValue);
      setInputValue('');
    } catch (error) {
      resolvedLogger.error('Failed to submit todo', {
        error: serializeError(error)
      });
    }
  };

  /**
   * Toggle a Todo's completion state.
   */
  const handleToggleTodo = (id: string): void => {
    try {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    } catch (error) {
      resolvedLogger.error('Failed to toggle todo', {
        error: serializeError(error),
        todoId: id
      });
    }
  };

  /**
   * Delete a Todo by id.
   */
  const handleDeleteTodo = (id: string): void => {
    try {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (error) {
      resolvedLogger.error('Failed to delete todo', {
        error: serializeError(error),
        todoId: id
      });
    }
  };

  const filteredTodos = useMemo<Todo[]>(() => {
    if (filter === 'active') {
      return todos.filter((todo) => !todo.completed);
    }

    if (filter === 'completed') {
      return todos.filter((todo) => todo.completed);
    }

    return todos;
  }, [todos, filter]);

  const counts = useMemo(
    () => ({
      all: todos.length,
      active: todos.filter((todo) => !todo.completed).length,
      completed: todos.filter((todo) => todo.completed).length
    }),
    [todos]
  );

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <TodoInput
        value={inputValue}
        onValueChange={setInputValue}
        onSubmit={handleSubmit}
      />

      <div className="flex flex-col gap-4">
        <TodoFilterControls
          activeFilter={filter}
          onChange={setFilter}
          counts={counts}
        />

        <div className="text-sm text-slate-600" role="status" aria-live="polite">
          {counts.all === 0
            ? 'No todos yet. Add your first task!'
            : `${counts.active} active, ${counts.completed} completed`}
        </div>

        <ul className="flex flex-col gap-3">
          {filteredTodos.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              Nothing here for this filter.
            </li>
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
              />
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
