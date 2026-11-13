import type { CalculatorAction } from "./calculatorReducer";

/** Keycap colour, one per row — mirrors the pastel calculator design. */
export type KeyTone = "pink" | "yellow" | "green" | "lavender" | "blue";

export type KeyDef = {
  label: string;
  ariaLabel?: string;
  action: CalculatorAction;
  tone: KeyTone;
};

const input = (tone: KeyTone, value: string, label = value, ariaLabel?: string): KeyDef => ({
  label,
  action: { type: "input", value },
  tone,
  ...(ariaLabel ? { ariaLabel } : {}),
});

const command = (
  tone: KeyTone,
  label: string,
  ariaLabel: string,
  type: Exclude<CalculatorAction["type"], "input">,
): KeyDef => ({ label, ariaLabel, tone, action: { type } as CalculatorAction });

/** 5×5 keypad, row by row. */
export const KEYPAD: readonly KeyDef[] = [
  command("pink", "MRC", "Memory recall", "memoryRecall"),
  command("pink", "M−", "Memory subtract", "memorySubtract"),
  command("pink", "M+", "Memory add", "memoryAdd"),
  command("pink", "√", "Square root", "sqrt"),
  input("pink", "%", "%", "Percent"),

  command("yellow", "→", "Backspace", "backspace"),
  input("yellow", "7"),
  input("yellow", "8"),
  input("yellow", "9"),
  input("yellow", "/", "÷", "Divide"),

  command("green", "CE", "Clear entry", "clearEntry"),
  input("green", "4"),
  input("green", "5"),
  input("green", "6"),
  input("green", "*", "×", "Multiply"),

  command("lavender", "AC", "All clear", "clear"),
  input("lavender", "1"),
  input("lavender", "2"),
  input("lavender", "3"),
  input("lavender", "-", "−", "Subtract"),

  input("blue", "0"),
  input("blue", "**", "**", "Power"),
  input("blue", ".", "·", "Decimal point"),
  command("blue", "=", "Equals", "evaluate"),
  input("blue", "+", "+", "Add"),
];

/** Maps physical keyboard keys to calculator actions. */
export function actionFromKey(key: string): CalculatorAction | null {
  if (/^[\d.+\-*/%]$/.test(key)) return { type: "input", value: key };
  if (key === "^") return { type: "input", value: "**" };
  if (key === "Enter" || key === "=") return { type: "evaluate" };
  if (key === "Backspace") return { type: "backspace" };
  if (key === "Delete") return { type: "clearEntry" };
  if (key === "Escape") return { type: "clear" };
  return null;
}
