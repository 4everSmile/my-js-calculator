import { describe, expect, it } from "vitest";
import {
  type CalculatorAction,
  type CalculatorState,
  calculatorReducer,
  initialState,
} from "./calculatorReducer";

const run = (actions: CalculatorAction[], from: CalculatorState = initialState) =>
  actions.reduce(calculatorReducer, from);
const typed = (expression: string): CalculatorState => ({ ...initialState, expression });
const press = (...values: string[]) =>
  run(values.map((value) => ({ type: "input", value }) as const));

describe("calculatorReducer", () => {
  it("appends input", () => {
    expect(run([{ type: "input", value: "7" }]).expression).toBe("7");
  });

  it("evaluates the expression", () => {
    expect(run([{ type: "evaluate" }], typed("6*7")).expression).toBe("42");
  });

  it("keeps the expression and sets an error on invalid input", () => {
    const state = run([{ type: "evaluate" }], typed("1+"));
    expect(state.expression).toBe("1+");
    expect(state.error).toBe("Expected a number");
  });

  it("ignores evaluate on empty expression", () => {
    expect(calculatorReducer(initialState, { type: "evaluate" })).toBe(initialState);
  });

  it("clears, clears entry and backspaces", () => {
    expect(run([{ type: "backspace" }], typed("123")).expression).toBe("12");
    expect(run([{ type: "clearEntry" }], typed("12+345")).expression).toBe("12+");
    expect(run([{ type: "clear" }], typed("12+345")).expression).toBe("");
  });

  it("normalises leading zeros and decimal points", () => {
    expect(press("0", "5").expression).toBe("5");
    expect(press("00").expression).toBe("0");
    expect(press("0", "00", "7").expression).toBe("7");
    expect(press(".").expression).toBe("0.");
    expect(press("1", ".", "2", ".", "3").expression).toBe("1.23");
    expect(press("1", ".", "+", ".", "5").expression).toBe("1.+0.5");
    expect(press("1", "0", "0").expression).toBe("100");
  });

  it("starts a new number after a result, but continues with an operator", () => {
    const shown = run([{ type: "evaluate" }], typed("2+3"));
    expect(calculatorReducer(shown, { type: "input", value: "7" }).expression).toBe("7");
    expect(calculatorReducer(shown, { type: "input", value: "." }).expression).toBe("0.");
    expect(calculatorReducer(shown, { type: "input", value: "*" }).expression).toBe("5*");
  });

  it("ignores √ and memory keys on an empty display", () => {
    for (const type of ["sqrt", "memoryAdd", "memorySubtract"] as const) {
      expect(calculatorReducer(initialState, { type })).toBe(initialState);
    }
  });

  it("takes the square root of the result", () => {
    expect(run([{ type: "sqrt" }], typed("8*2")).expression).toBe("4");
    expect(run([{ type: "sqrt" }], typed("0-9")).error).toBe("Invalid input");
    // Typing after √ starts a new number instead of appending to the root.
    expect(run([{ type: "sqrt" }, { type: "input", value: "5" }], typed("9")).expression).toBe("5");
  });

  describe("memory", () => {
    it("adds and subtracts results", () => {
      const state = run(
        [{ type: "memoryAdd" }, { type: "clear" }, { type: "input", value: "3" }, { type: "memorySubtract" }],
        typed("2*5"),
      );
      expect(state.memory).toBe(7);
    });

    it("MRC recalls, replacing the number being typed", () => {
      const state = run([{ type: "memoryRecall" }], { ...typed("1+99"), memory: 5 });
      expect(state.expression).toBe("1+5");
    });

    it("pressing MRC twice clears memory", () => {
      const state = run([{ type: "memoryRecall" }, { type: "memoryRecall" }], { ...initialState, memory: 5 });
      expect(state.memory).toBe(0);
    });

    it("MRC recalls memory too large for the display in full", () => {
      const state = run([{ type: "memoryRecall" }], { ...initialState, memory: 1e12 });
      expect(state.expression).toBe("1000000000000");
      expect(state.error).toBeNull();
    });

    it("AC keeps memory", () => {
      expect(run([{ type: "clear" }], { ...typed("1"), memory: 5 }).memory).toBe(5);
    });
  });
});
