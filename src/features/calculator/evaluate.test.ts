import { describe, expect, it } from "vitest";
import { EvaluationError, evaluate, formatResult } from "./evaluate.ts";

describe("evaluate", () => {
  it.each([
    ["1+2", 3],
    ["2+3*4", 14],
    ["10-4-3", 3],
    ["20/4/5", 1],
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
    expect(() => evaluate("5/0%")).toThrow("Division by zero");
  });

  describe("percent", () => {
    it.each([
      ["9%", 0.09],
      ["200+10%", 220],
      ["200-10%", 180],
      ["50*10%", 5],
      ["50/10%", 500],
      ["10%*50", 5],
      ["200+-10%", 180],
      ["100+50*10%", 105], // "50*10%" is a product (5), not a percentage of 100
      ["2**3%", 0.08],
      ["1+2+10%", 3.3], // percent of the running total
    ])("%s = %d", (expression, expected) => {
      expect(evaluate(expression)).toBeCloseTo(expected, 10);
    });

    it.each(["9%5", "10%%", "%5"])("rejects %j", (expression) => {
      expect(() => evaluate(expression)).toThrow(EvaluationError);
    });
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

  it.each([
    [79 / 6, "13.16666667"], // was cut to ".1666666667" on the 10-cell LCD
    [1 / 3, "0.333333333"],
    [-1 / 3, "-0.33333333"], // "-" uses a cell, "." doesn't
    [2 / 3, "0.666666667"],
    [123_456.789_123, "123456.7891"],
    [9_999_999_999, "9999999999"],
    [-999_999_999, "-999999999"],
    [1e-7, "0.0000001"],
    [1e-12, "0"],
    [-1e-12, "0"],
  ])("rounds %d to fit 10 cells as %s", (value, expected) => {
    expect(formatResult(value)).toBe(expected);
  });

  it.each([
    [1e10, "10000000000"],
    [-1e10, "-10000000000"],
    [9_999_999_999.6, "10000000000"],
    [12_345_678_901.4, "12345678901"],
    [1e21, "1000000000000000000000"], // never "1e+21"
  ])("keeps every digit of a too-long result %d: %s", (value, expected) => {
    expect(formatResult(value)).toBe(expected);
  });

  it("writes huge results as plain digits", () => {
    expect(formatResult(1e300)).toMatch(/^1\d{300}$/);
  });
});
