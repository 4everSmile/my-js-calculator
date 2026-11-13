/**
 * Safe arithmetic evaluator — replaces `eval()`.
 *
 * Grammar (lowest → highest precedence):
 *   expression := term (("+" | "-") term)*
 *   term       := unary (("*" | "/") unary)*
 *   unary      := ("+" | "-") unary | power "%"?
 *   power      := number ("**" signed)?       // right-associative; signed = unary without "%"
 *
 * Unary minus binds looser than `**`, so `-2**2 === -4` (math convention).
 *
 * "%" is percent, as on a desk calculator: `B%` is B / 100, except that in
 * `A + B%` and `A − B%` it is B percent *of A*:
 *   9%        → 0.09        50 × 10% → 5
 *   200 + 10% → 220         50 ÷ 10% → 500
 *   200 − 10% → 180
 */

import { LCD_CELLS, cellCount } from "./lcd";

export class EvaluationError extends Error {
  override name = "EvaluationError";
}

type Token = { type: "number"; value: number } | { type: "op"; value: Operator };

export type Operator = "+" | "-" | "*" | "/" | "%" | "**";

const NUMBER_RE = /^(?:\d+\.?\d*|\.\d+)/;
const OPERATOR_RE = /^(?:\*\*|[+\-*/%])/;

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let rest = input.replaceAll(/\s+/g, "");

  while (rest.length > 0) {
    const num = NUMBER_RE.exec(rest);
    if (num) {
      tokens.push({ type: "number", value: Number.parseFloat(num[0]) });
      rest = rest.slice(num[0].length);
      continue;
    }
    const op = OPERATOR_RE.exec(rest);
    if (op) {
      tokens.push({ type: "op", value: op[0] as Operator });
      rest = rest.slice(op[0].length);
      continue;
    }
    throw new EvaluationError(`Unexpected character "${rest[0]}"`);
  }
  return tokens;
}

/** A parsed operand, remembering whether it was written as a percentage. */
type Operand = { value: number; isPercent: boolean };

class Parser {
  #tokens: Token[];
  #pos = 0;

  constructor(tokens: Token[]) {
    this.#tokens = tokens;
  }

  parse(): number {
    if (this.#tokens.length === 0) throw new EvaluationError("Empty expression");
    const value = this.#expression();
    if (this.#pos < this.#tokens.length) throw new EvaluationError("Unexpected token");
    return value;
  }

  #peekOp(...ops: Operator[]): Operator | undefined {
    const token = this.#tokens[this.#pos];
    return token?.type === "op" && ops.includes(token.value) ? token.value : undefined;
  }

  #expression(): number {
    let left = this.#term().value;
    for (let op = this.#peekOp("+", "-"); op; op = this.#peekOp("+", "-")) {
      this.#pos++;
      const right = this.#term();
      // "A + B%" adds B percent of A.
      const amount = right.isPercent ? left * right.value : right.value;
      left = op === "+" ? left + amount : left - amount;
    }
    return left;
  }

  #term(): Operand {
    let left = this.#unary();
    for (let op = this.#peekOp("*", "/"); op; op = this.#peekOp("*", "/")) {
      this.#pos++;
      const right = this.#unary().value;
      if (op === "/" && right === 0) throw new EvaluationError("Division by zero");
      left = { value: op === "*" ? left.value * right : left.value / right, isPercent: false };
    }
    return left;
  }

  #unary(allowPercent = true): Operand {
    const op = this.#peekOp("+", "-");
    if (op) {
      this.#pos++;
      const operand = this.#unary(allowPercent);
      return { ...operand, value: op === "-" ? -operand.value : operand.value };
    }
    const value = this.#power();
    if (allowPercent && this.#peekOp("%")) {
      this.#pos++;
      return { value: value / 100, isPercent: true };
    }
    return { value, isPercent: false };
  }

  #power(): number {
    const base = this.#number();
    if (this.#peekOp("**")) {
      this.#pos++;
      // "2**3%" is (2**3)%, so the exponent itself can't take a "%".
      return base ** this.#unary(false).value;
    }
    return base;
  }

  #number(): number {
    const token = this.#tokens[this.#pos];
    if (token?.type !== "number") throw new EvaluationError("Expected a number");
    this.#pos++;
    return token.value;
  }
}

/** Evaluates an arithmetic expression. Throws `EvaluationError` on invalid input. */
export function evaluate(expression: string): number {
  const result = new Parser(tokenize(expression)).parse();
  if (!Number.isFinite(result)) throw new EvaluationError("Result is out of range");
  return result;
}

/** Plain decimal notation — never "1e-7", which the parser can't read back. */
function toPlain(value: number, maxCells: number): string {
  const text = String(value);
  if (!text.includes("e")) return text;
  // Tiny numbers become 0.000…; huge ones (≥ 1e21) stay in "e" form and the caller handles them.
  const sign = value < 0 ? 1 : 0;
  const fixed = value.toFixed(maxCells - 1 - sign).replace(/\.?0+$/, "");
  return fixed === "-0" ? "0" : fixed;
}

/**
 * Rounds a result to fit the display, like a real calculator: as many significant
 * digits as fit in `maxCells` (a "-" takes a cell, "." doesn't). Also trims
 * floating-point noise, e.g. 0.1 + 0.2 → "0.3" and 79 / 6 → "13.16666667".
 *
 * If even the whole-number part is too long, returns it in full (rounded to a whole
 * number, never "e" notation); the display then shows its first cells.
 */
export function formatResult(value: number, maxCells = LCD_CELLS): string {
  for (let digits = maxCells; digits >= 1; digits--) {
    const text = toPlain(Number.parseFloat(value.toPrecision(digits)), maxCells);
    const wholePart = text.split(".")[0] ?? text;
    if (wholePart.length > maxCells || text.includes("e")) {
      // BigInt prints every digit of the number, even past 1e21.
      return BigInt(Math.round(value)).toString();
    }
    if (cellCount(text) <= maxCells) return text;
  }
  return "0";
}
