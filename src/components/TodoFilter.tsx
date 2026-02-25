import type { TodoFilter } from '../types/todo';

interface TodoFilterProps {
  activeFilter: TodoFilter;
  onChange: (filter: TodoFilter) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

const FILTERS: Array<{ value: TodoFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' }
];

/**
 * Filter buttons for switching between Todo views.
 */
export default function TodoFilter({
  activeFilter,
  onChange,
  counts
}: TodoFilterProps): JSX.Element {
  /**
   * Render a single filter button.
   */
  const renderButton = (filter: TodoFilter, label: string, count: number): JSX.Element => {
    const isActive = activeFilter === filter;

    return (
      <button
        key={filter}
        type="button"
        onClick={() => onChange(filter)}
        aria-pressed={isActive}
        className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition ${
          isActive
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
        }`}
      >
        <span>{label}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) =>
        renderButton(filter.value, filter.label, counts[filter.value])
      )}
    </div>
  );
}
