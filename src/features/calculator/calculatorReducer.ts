import { EvaluationError, evaluate, formatResult } from "./evaluate";

export type CalculatorState = {
  expression: string;
  error: string | null;
  /** Value stored with M+ / M−. */
  memory: number;
  /** True right after MRC, so a second MRC press clears memory (like a real calculator). */
  memoryRecalled: boolean;
  /** True while the display shows a result: typing a digit starts a new number. */
  showingResult: boolean;
};

export type CalculatorAction =
  | { type: "input"; value: string }
  | { type: "clear" }
  | { type: "clearEntry" }
  | { type: "backspace" }
  | { type: "evaluate" }
  | { type: "sqrt" }
  | { type: "memoryAdd" }
  | { type: "memorySubtract" }
  | { type: "memoryRecall" };

export const initialState: CalculatorState = {
  expression: "",
  error: null,
  memory: 0,
  memoryRecalled: false,
  showingResult: false,
};

/** Matches the number being typed at the end of the expression. */
const TRAILING_NUMBER = /(?:\d+\.?\d*|\.\d+)$/;
const isNumberInput = (value: string) => /^[\d.]+$/.test(value);

/** Appends typed input, normalising leading zeros and duplicate decimal points. */
function appendInput(expression: string, value: string): string {
  if (!isNumberInput(value)) return expression + value;

  const current = TRAILING_NUMBER.exec(expression)?.[0] ?? "";
  const base = expression.slice(0, expression.length - current.length);

  if (value === ".") {
    if (current.includes(".")) return expression; // "1.2" + "." → unchanged
    return base + (current || "0") + "."; // "" + "." → "0."
  }
  // "0" + "5" → "5", "0" + "00" → "0"
  if (current === "0") return base + (/^0+$/.test(value) ? "0" : value.replace(/^0+/, ""));
  // A number can't start with "00".
  if (current === "" && /^0+$/.test(value)) return base + "0";
  return expression + value;
}

/**
 * Evaluates the expression and applies `apply` to the result, which is then shown.
 * Does nothing on an empty expression.
 */
function withResult(
  state: CalculatorState,
  apply: (value: number) => Partial<CalculatorState> & { display: number },
): CalculatorState {
  if (state.expression === "") return state;
  try {
    const { display, ...rest } = apply(evaluate(state.expression));
    return { ...state, ...rest, expression: formatResult(display), error: null, showingResult: true };
  } catch (error) {
    if (error instanceof EvaluationError) return { ...state, error: error.message };
    throw error;
  }
}

function reduce(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case "input": {
      // After a result, a number starts fresh; an operator continues from the result.
      const from = state.showingResult && isNumberInput(action.value) ? "" : state.expression;
      return { ...state, expression: appendInput(from, action.value), error: null };
    }
    case "clear":
      return { ...state, expression: "", error: null };
    case "clearEntry":
      return { ...state, expression: state.expression.replace(TRAILING_NUMBER, ""), error: null };
    case "backspace":
      return { ...state, expression: state.expression.slice(0, -1), error: null };
    case "evaluate":
      return withResult(state, (value) => ({ display: value }));
    case "sqrt":
      return withResult(state, (value) => {
        if (value < 0) throw new EvaluationError("Invalid input");
        return { display: Math.sqrt(value) };
      });
    case "memoryAdd":
      return withResult(state, (value) => ({ display: value, memory: state.memory + value }));
    case "memorySubtract":
      return withResult(state, (value) => ({ display: value, memory: state.memory - value }));
    case "memoryRecall": {
      if (state.memoryRecalled) return { ...state, memory: 0 };
      // Replace the number being typed (or the shown result), or append after an operator.
      const base = state.showingResult ? "" : state.expression.replace(TRAILING_NUMBER, "");
      try {
        return {
          ...state,
          expression: base + formatResult(state.memory),
          error: null,
          showingResult: true,
        };
      } catch (error) {
        // Memory can grow past what the display fits after repeated M+.
        if (error instanceof EvaluationError) return { ...state, error: error.message };
        throw error;
      }
    }
  }
}

/** Actions that leave a result on the display. */
const RESULT_ACTIONS = new Set<CalculatorAction["type"]>([
  "evaluate",
  "sqrt",
  "memoryAdd",
  "memorySubtract",
  "memoryRecall",
]);

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  const next = reduce(state, action);
  const memoryRecalled = action.type === "memoryRecall" && !state.memoryRecalled;
  // Any other action (typing, clearing, deleting) means the display is no longer a result.
  const showingResult = RESULT_ACTIONS.has(action.type) && next.showingResult;
  if (next.memoryRecalled === memoryRecalled && next.showingResult === showingResult) return next;
  return { ...next, memoryRecalled, showingResult };
}
