# My JS Calculator

A small calculator built with React 19, TypeScript, and Vite. Bun manages packages and runs scripts, and oxlint handles linting.

## Getting started

```sh
bun install
bun run dev
```

## Scripts

| Script              | What it does                          |
| ------------------- | ------------------------------------- |
| `bun run dev`       | Start the Vite dev server             |
| `bun run build`     | Type-check and build to `dist/`       |
| `bun run preview`   | Serve the production build            |
| `bun run lint`      | Lint with oxlint (`lint:fix` to fix)  |
| `bun run typecheck` | Run the TypeScript compiler           |
| `bun run test`      | Run Vitest in watch mode (`test:run` runs once) |
| `bun run check`     | Lint, type-check, and test            |

## Structure

```
src/
  main.tsx                  entry point
  App.tsx                   page shell
  features/calculator/
    Calculator.tsx          state (useReducer) + keyboard handling
    Display.tsx, Keypad.tsx presentational components
    calculatorReducer.ts    pure state transitions
    evaluate.ts             safe expression parser (no eval)
    keys.ts                 keypad layout + key bindings
```

## Keyboard

Digits, `.`, `+ - * / %`, `^` (power), `Enter`/`=` to evaluate, `Backspace` to delete, `Esc` to clear.
