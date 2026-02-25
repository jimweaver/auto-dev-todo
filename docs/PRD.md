# PRD — Todo App (proj_6b5282c2)

**Issue:** #123 · **Author:** tj · **Date:** 2026-02-25

## 1. Overview

A minimal, browser-only todo list application. Users can add, complete,
and delete tasks, filter by status, and have their data persisted locally.
This is an MVP / learning project to validate the Auto-Dev pipeline.

## 2. Target User

Individual developer or learner using a modern browser.
No accounts, no collaboration, no server.

## 3. Core Features

| # | Feature | Priority |
|---|---------|----------|
| F1 | Add todo (text input + Enter) | P0 |
| F2 | Toggle complete / incomplete | P0 |
| F3 | Delete todo | P0 |
| F4 | Filter: All / Active / Completed | P0 |
| F5 | Persist in localStorage | P0 |
| F6 | Responsive (mobile-friendly) | P1 |

## 4. Data Model

```typescript
interface Todo {
  id: string;        // crypto.randomUUID() or fallback
  text: string;      // user-provided, trimmed
  completed: boolean; // toggle state
}

type TodoFilter = 'all' | 'active' | 'completed';
```

Stored as `JSON.stringify(Todo[])` under `localStorage["todo-items"]`.

## 5. UI Structure

```
┌─────────────────────────────────┐
│  Todo App                       │  ← header
│  Keep track of tasks locally.   │
├─────────────────────────────────┤
│  [Add a task _______________]   │  ← TodoInput
│                                 │
│  (All 3) (Active 2) (Completed 1)│  ← TodoFilter
│  2 active, 1 completed         │  ← status line
│                                 │
│  ☑ Buy milk           [Delete] │  ← TodoItem
│  ☐ Read docs           [Delete] │
│  ☐ Ship feature        [Delete] │
└─────────────────────────────────┘
```

Max width `3xl` (48rem), centered. Stacks vertically on mobile.

## 6. Acceptance Criteria

- [x] AC-1: Add todo on Enter
- [x] AC-2: Toggle completion
- [x] AC-3: Delete todos
- [x] AC-4: Filters work
- [x] AC-5: Data persists after refresh
- [ ] AC-6: Responsive on mobile (needs visual verification)

## 7. Out of Scope

- Backend / API routes
- Authentication
- Categories, tags, priorities
- Drag-and-drop reorder
- Dark mode (nice-to-have for v2)

## 8. Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js 14 App Router | Issue requirement; `'use client'` for state |
| StorageAdapter abstraction | Enables DI for testing (memory adapter in tests) |
| Structured Logger | Clean separation, noop logger in tests |
| Vitest + RTL over Jest | Faster, native ESM, recommended for Vite ecosystem |
| `crypto.randomUUID()` | Unique IDs without uuid dep; fallback for non-secure contexts |
