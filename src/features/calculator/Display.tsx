import type { ReactNode } from "react";
import { LCD_CELLS } from "./lcd";


/**
 * Operators are drawn in the UI font — 14-segment glyphs for "%", "*", "/" are
 * unreadable. Each still occupies exactly one LCD cell, so LCD_CELLS always fit.
 */
const OPERATOR_GLYPHS: Record<string, string> = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
  "%": "%",
  "**": "^",
};

/** Splits into display tokens: "**" is one token, every other character is one. */
const tokenize = (text: string): string[] => text.match(/\*\*|[\s\S]/g) ?? [];

/**
 * Last `cells` LCD cells, like real hardware. In DSEG fonts "." has zero width
 * (it lights the previous cell's decimal point), so it doesn't use a cell.
 */
function lastCells(tokens: string[], cells: number): string[] {
  let used = 0;
  let start = tokens.length;
  while (start > 0) {
    const isDot = tokens[start - 1] === ".";
    if (!isDot && used === cells) break;
    if (!isDot) used++;
    start--;
  }
  return tokens.slice(start);
}

/** Groups digits into DSEG text runs and renders operators as one-cell glyphs. */
function renderCells(tokens: string[]): ReactNode[] {
  const nodes: ReactNode[] = [];
  let digits = "";
  const flush = () => {
    if (digits) nodes.push(digits);
    digits = "";
  };
  for (const [index, token] of tokens.entries()) {
    const glyph = OPERATOR_GLYPHS[token];
    if (glyph === undefined) {
      digits += token;
      continue;
    }
    flush();
    nodes.push(
      // One DSEG14 cell: 0.816em wide, and exactly one line (1em) tall so the
      // UI font's taller line metrics can't grow the LCD.
      <span
        key={index}
        className="inline-flex h-[1em] w-[0.816em] items-center justify-center align-top"
      >
        <span className="font-sans text-[0.95em] leading-none font-semibold not-italic">
          {glyph}
        </span>
      </span>,
    );
  }
  flush();
  return nodes;
}

type DisplayProps = {
  expression: string;
  error: string | null;
  hasMemory: boolean;
};

export function Display({ expression, error, hasMemory }: DisplayProps) {
  const text = expression || "0";
  const visible = lastCells(tokenize(text), LCD_CELLS);

  return (
    <div className="min-w-0 rounded-[1.75rem] bg-calc-bezel p-3 shadow-[inset_0_2px_4px_rgb(0_0_0/0.08)]">
      <div className="relative overflow-hidden rounded-xl bg-lcd pt-6 pr-4 pb-4 pl-3 text-lcd-foreground shadow-[inset_0_3px_6px_rgb(0_0_0/0.18)]">
        <span
          aria-hidden="true"
          className="absolute top-1.5 left-3 font-sans text-[0.65rem] font-semibold tracking-wider"
        >
          {hasMemory ? "M" : ""}
          {error ? " E" : ""}
        </span>
        {/*
          Size the digits from the LCD width so LCD_CELLS always fit: each DSEG14 cell is
          0.816em wide, so 10 cells = 8.16em → font-size ≤ 100cqw / 8.16 ≈ 12.25cqw.
          `@container` also stops long content from widening the calculator.
        */}
        <div className="@container">
          <div className="h-[1em] text-right font-lcd text-[12cqw] leading-none whitespace-pre">
            <output aria-live="polite" aria-label="Display" title={text}>
              {renderCells(visible)}
            </output>
          </div>
        </div>
      </div>
      <p role="alert" className="h-6 truncate px-2 pt-1.5 text-right text-xs leading-4 font-medium text-primary">
        {error}
      </p>
    </div>
  );
}
