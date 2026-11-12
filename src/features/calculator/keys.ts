import type { CalculatorAction } from "./calculatorReducer.ts";

export type KeyDef = {
  label: string;
  ariaLabel?: string;
  action: CalculatorAction;
  variant?: "clear" | "operator" | "equals";
  wide?: boolean;
};

const digit = (value: string, ariaLabel?: string): KeyDef => ({
  label: value,
  action: { type: "input", value },
  ...(ariaLabel ? { ariaLabel } : {}),
});

const operator = (value: string, ariaLabel: string): KeyDef => ({
  ...digit(value, ariaLabel),
  variant: "operator",
});

/** Keypad layout, row by row — mirrors the original calculator. */
export const KEYPAD: readonly KeyDef[] = [
  { label: "C", ariaLabel: "Clear", action: { type: "clear" }, variant: "clear" },
  operator("**", "Power"),
  operator("%", "Modulo"),
  operator("/", "Divide"),
  digit("7"),
  digit("8"),
  digit("9"),
  operator("*", "Multiply"),
  digit("4"),
  digit("5"),
  digit("6"),
  operator("-", "Subtract"),
  digit("1"),
  digit("2"),
  digit("3"),
  operator("+", "Add"),
  digit(".", "Decimal point"),
  digit("0"),
  { label: "=", ariaLabel: "Equals", action: { type: "evaluate" }, variant: "equals", wide: true },
];

/** Maps physical keyboard keys to calculator actions. */
export function actionFromKey(key: string): CalculatorAction | null {
  if (/^[\d.+\-*/%]$/.test(key)) return { type: "input", value: key };
  if (key === "^") return { type: "input", value: "**" };
  if (key === "Enter" || key === "=") return { type: "evaluate" };
  if (key === "Backspace") return { type: "backspace" };
  if (key === "Escape" || key === "Delete") return { type: "clear" };
  return null;
}
