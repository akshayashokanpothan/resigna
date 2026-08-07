# Engineering Onboarding

Welcome to the Resigna team.

## Getting Started

1. Request access to the Resigna Supabase project.
2. Copy `.env.local.example` to `.env.local` and add your keys.
3. Run `npm install`.
4. Run `npm run dev`.

## The Constitution

Before writing any code, read the `ENGINEERING_CONSTITUTION.md` at the root of the project. It outlines our non-negotiable standards for code quality, TypeScript usage, and architectural boundaries.

## Component Standards

- We use Tailwind CSS via `cn()` utility.
- Never use hardcoded colors (e.g. `#fff` or `text-blue-500`). Always use design tokens `text-[hsl(var(--foreground))]`.
- No loading spinners. Use skeleton components.
- Every page/section must support Loading, Empty, and Error states natively.

## Testing

- Unit tests for pure domain functions.
- Render tests for shared UI components.
- Playwright E2E for critical paths.
