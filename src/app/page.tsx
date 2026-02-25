import TodoApp from '../components/TodoApp';

/**
 * Home page that hosts the Todo application.
 */
export default function HomePage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-semibold text-slate-900">Todo App</h1>
        <p className="text-slate-600">
          Keep track of tasks locally. Data is saved in your browser.
        </p>
      </header>
      <TodoApp />
    </main>
  );
}
