/**
 * Represents a single Todo item.
 */
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

/**
 * Supported filters for the Todo list UI.
 */
export type TodoFilter = 'all' | 'active' | 'completed';
