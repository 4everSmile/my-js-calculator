import { describe, expect, it } from "vitest";
import { EvaluationError, evaluate, formatResult } from "./evaluate.ts";

describe("evaluate", () => {
  it.each([
    ["1+2", 3],
    ["2+3*4", 14],
    ["10-4-3", 3],
    ["20/4/5", 1],
    ["10%3", 1],
    ["2**3", 8],
    ["2**3**2", 512],
    ["-2**2", -4],
    ["3*-2", -6],
    ["--5", 5],
    [".5+.5", 1],
    ["1.5*2", 3],
  ])("%s = %d", (expression, expected) => {
    expect(evaluate(expression)).toBe(expected);
  });

  it.each(["", "1+", "*2", "1..2", "1+*2", "abc", "alert(1)"])(
    "rejects invalid input %j",
    (expression) => {
      expect(() => evaluate(expression)).toThrow(EvaluationError);
    },
  );

  it("rejects division by zero", () => {
    expect(() => evaluate("1/0")).toThrow("Division by zero");
    expect(() => evaluate("1%0")).toThrow("Division by zero");
  });

  it("rejects non-finite results", () => {
    expect(() => evaluate("10**1000")).toThrow("out of range");
  });
});

describe("formatResult", () => {
  it("trims floating-point noise", () => {
    expect(formatResult(0.1 + 0.2)).toBe("0.3");
    expect(formatResult(42)).toBe("42");
  });
});
