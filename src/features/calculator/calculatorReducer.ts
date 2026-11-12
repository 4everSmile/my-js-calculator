import { EvaluationError, evaluate, formatResult } from "./evaluate.ts";

export type CalculatorState = {
  expression: string;
  error: string | null;
};

export type CalculatorAction =
  | { type: "input"; value: string }
  | { type: "clear" }
  | { type: "backspace" }
  | { type: "evaluate" };

export const initialState: CalculatorState = { expression: "", error: null };

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  switch (action.type) {
    case "input":
      return { expression: state.expression + action.value, error: null };
    case "clear":
      return initialState;
    case "backspace":
      return { expression: state.expression.slice(0, -1), error: null };
    case "evaluate": {
      if (state.expression === "") return state;
      try {
        return { expression: formatResult(evaluate(state.expression)), error: null };
      } catch (error) {
        if (error instanceof EvaluationError) return { ...state, error: error.message };
        throw error;
      }
    }
  }
}
