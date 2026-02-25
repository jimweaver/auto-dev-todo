import type { ChangeEvent, KeyboardEvent } from 'react';

interface TodoInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
}

/**
 * Text input used to create new Todo items.
 */
export default function TodoInput({
  value,
  onValueChange,
  onSubmit
}: TodoInputProps): JSX.Element {
  /**
   * Update the current input value.
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onValueChange(event.target.value);
  };

  /**
   * Submit when the user presses Enter.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor="todo-input" className="text-sm font-medium text-slate-700">
        Add a task
      </label>
      <input
        id="todo-input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="What needs to be done?"
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        aria-label="Add a todo"
      />
    </div>
  );
}
