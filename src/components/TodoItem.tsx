import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Single Todo row with completion toggle and delete action.
 */
export default function TodoItem({
  todo,
  onToggle,
  onDelete
}: TodoItemProps): JSX.Element {
  /**
   * Toggle the completion state for this Todo.
   */
  const handleToggle = (): void => {
    onToggle(todo.id);
  };

  /**
   * Delete this Todo.
   */
  const handleDelete = (): void => {
    onDelete(todo.id);
  };

  return (
    <li
      className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      data-completed={todo.completed}
    >
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          aria-label={`Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`}
          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
        />
        <span
          className={`text-base ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}
        >
          {todo.text}
        </span>
      </label>
      <button
        type="button"
        onClick={handleDelete}
        className="text-sm font-medium text-red-600 hover:text-red-700"
        aria-label={`Delete ${todo.text}`}
      >
        Delete
      </button>
    </li>
  );
}
