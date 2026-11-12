import { describe, expect, it } from "vitest";
import { calculatorReducer, initialState } from "./calculatorReducer.ts";

describe("calculatorReducer", () => {
  it("appends input", () => {
    const state = calculatorReducer(initialState, { type: "input", value: "7" });
    expect(state).toEqual({ expression: "7", error: null });
  });

  it("evaluates the expression", () => {
    const state = calculatorReducer(
      { expression: "6*7", error: null },
      { type: "evaluate" },
    );
    expect(state.expression).toBe("42");
  });

  it("keeps the expression and sets an error on invalid input", () => {
    const state = calculatorReducer({ expression: "1+", error: null }, { type: "evaluate" });
    expect(state).toEqual({ expression: "1+", error: "Expected a number" });
  });

  it("ignores evaluate on empty expression", () => {
    expect(calculatorReducer(initialState, { type: "evaluate" })).toBe(initialState);
  });

  it("clears and backspaces", () => {
    const filled = { expression: "123", error: "x" };
    expect(calculatorReducer(filled, { type: "backspace" })).toEqual({ expression: "12", error: null });
    expect(calculatorReducer(filled, { type: "clear" })).toEqual(initialState);
  });
});
