/**
 * Safe arithmetic evaluator — replaces `eval()`.
 *
 * Grammar (lowest → highest precedence):
 *   expression := term (("+" | "-") term)*
 *   term       := unary (("*" | "/" | "%") unary)*
 *   unary      := ("+" | "-") unary | power
 *   power      := number ("**" unary)?        // right-associative
 *
 * Unary minus binds looser than `**`, so `-2**2 === -4` (math convention).
 */

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
    let left = this.#term();
    for (let op = this.#peekOp("+", "-"); op; op = this.#peekOp("+", "-")) {
      this.#pos++;
      const right = this.#term();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  #term(): number {
    let left = this.#unary();
    for (let op = this.#peekOp("*", "/", "%"); op; op = this.#peekOp("*", "/", "%")) {
      this.#pos++;
      const right = this.#unary();
      if ((op === "/" || op === "%") && right === 0) {
        throw new EvaluationError("Division by zero");
      }
      left = op === "*" ? left * right : op === "/" ? left / right : left % right;
    }
    return left;
  }

  #unary(): number {
    const op = this.#peekOp("+", "-");
    if (op) {
      this.#pos++;
      const value = this.#unary();
      return op === "-" ? -value : value;
    }
    return this.#power();
  }

  #power(): number {
    const base = this.#number();
    if (this.#peekOp("**")) {
      this.#pos++;
      return base ** this.#unary();
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

/** Trims floating-point noise, e.g. 0.1 + 0.2 → "0.3". */
export function formatResult(value: number): string {
  return String(Number.parseFloat(value.toPrecision(12)));
}
