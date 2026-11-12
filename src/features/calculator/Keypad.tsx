import { memo } from "react";
import styles from "./Calculator.module.css";
import type { CalculatorAction } from "./calculatorReducer.ts";
import { KEYPAD } from "./keys.ts";

type KeypadProps = {
  onAction: (action: CalculatorAction) => void;
};

export const Keypad = memo(function Keypad({ onAction }: KeypadProps) {
  return (
    <div className={styles.keypad}>
      {KEYPAD.map((key) => (
        <button
          key={key.label}
          type="button"
          className={styles.key}
          data-variant={key.variant}
          data-wide={key.wide || undefined}
          aria-label={key.ariaLabel}
          onClick={() => onAction(key.action)}
        >
          {key.label}
        </button>
      ))}
    </div>
  );
});
