# Engineering Constitution

> These rules are non-negotiable. They apply to every engineer, every sprint, every commit.
> Exceptions require explicit team agreement and a documented reason.

---

## 1. TypeScript

- **Never use `any`.** Use `unknown` and narrow with type guards.
- **Never suppress TypeScript errors** with `@ts-ignore` or `@ts-expect-error` without a comment explaining exactly why it is necessary and what the correct fix would be.
- Strict mode is always on: `strict: true`, `noUncheckedIndexedAccess: true`.
- All function parameters and return types must be explicitly typed in public APIs.

## 2. Code Quality

- **Never bypass ESLint.** `eslint-disable` requires a comment justifying the exception.
- **Never leave commented-out code in a commit.** Delete dead code. Use version control.
- **Never merge unresolved TODOs into main.** Convert to issues. Code is not a task tracker.
- No `console.log` in production code. Use `logger.info()`, `logger.error()`, etc.

## 3. Architecture — Layer Rules

The application has four strict layers. Dependencies flow downward only.

```
UI → Application → Domain → Infrastructure
```

- **UI Layer** (components, pages): Presentation only. No business logic. No direct Supabase calls.
- **Application Layer** (hooks, queries, mutations): Orchestration. Calls repository interfaces, not Supabase.
- **Domain Layer** (types, schemas, domain functions): Pure business rules. Zero framework dependencies.
- **Infrastructure Layer** (repository implementations): Only place Supabase APIs are called.

Violation of these rules is a blocking code review comment, not a suggestion.

## 4. Module Boundaries

- Every module MUST expose a public API through `index.ts`.
- Cross-module imports MUST only use `index.ts`. Never reach into a module's internal files.
  - ✅ `import { useProjects } from '@/modules/projects'`
  - ❌ `import { useProjects } from '@/modules/projects/hooks/use-projects'`
- Business logic NEVER belongs inside UI components.
- Components are presentation-focused. All orchestration goes in hooks.

## 5. Infrastructure Abstraction

- All infrastructure (Supabase, external APIs, storage) is accessed through repository interfaces.
- UI and application layers never import from `@supabase/supabase-js` directly.
- Every repository interface has an implementation; implementations are swappable without call-site changes.

## 6. State Management

- **UI state** (open/closed, collapsed/expanded) → Zustand.
- **Server state** (data from API) → TanStack Query.
- Never store server data in Zustand. This creates stale data problems.
- Never fetch data in Server Components to then pass as props to Client Components that also fetch the same data.

## 7. Design System

- **Shared design tokens must always be used.** No hardcoded hex, hsl, rgb, rem, or px values in components.
- All color references use `hsl(var(--token))` syntax from `globals.css`.
- All spacing uses Tailwind's scale derived from the 4px base grid.
- All animations import from `shared/theme/motion.ts`. No component-local animation definitions.

## 8. UX Standards

- **Every screen must support three states: Loading, Empty, and Error.**
  - Loading → skeleton components (never spinners)
  - Empty → `EmptyState` component
  - Error → `ErrorPage`, `NetworkError`, or `RetryButton` as appropriate
- Never use loading spinners. Skeleton loading only.
- No hardcoded user-facing copy scattered in JSX. All copy is explicit and intentional.
- All interactive elements must be keyboard accessible with visible focus states.

## 9. Error Handling

- All thrown errors must extend `AppError`.
- All error codes must be registered in `ErrorCode` enum.
- All errors flow through `logger` before being displayed.
- Toast calls go through `shared/utils/toast.ts` — never import `sonner` directly in components.

## 10. Testing

- Domain layer functions must have unit tests (pure functions are trivially testable).
- Shared components must have render tests.
- E2E tests cover critical auth flows and protected route behavior.
- Tests are co-located with the code they test (`*.test.ts`, `*.spec.ts`).

## 11. Future Extension Rules

### AI Providers

- AI providers MUST be abstracted behind an `AIProvider` interface.
- No direct AI SDK calls (`openai.chat.completions.create()`) in components, hooks, or services.
- Swapping AI providers requires zero UI changes.

### Figma Plugin (Future)

- The plugin is a renderer, not a product.
- The plugin consumes platform APIs only.
- The plugin may not contain business logic, data transformation, or AI calls.
- See ADR-0002.

### New Modules

- Every new module must include a `README.md` explaining:
  - Purpose and ownership
  - Public API shape
  - Architectural constraints and dependencies

## 12. What is Forbidden

| Forbidden                             | Reason                           |
| ------------------------------------- | -------------------------------- |
| `any` type                            | Defeats TypeScript's purpose     |
| Direct Supabase calls in UI           | Breaks layer isolation           |
| Cross-module internal imports         | Breaks module encapsulation      |
| Loading spinners                      | Skeleton loading is the standard |
| Hardcoded color/spacing values        | Breaks design system integrity   |
| Business logic in components          | Untestable, non-reusable         |
| `console.log` in commits              | Use logger                       |
| Commented-out code                    | Use version control              |
| Direct `sonner` imports in components | Use toast utility                |
| AI SDK calls outside AI module        | Breaks abstraction               |
