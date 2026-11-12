import { useEffect, useReducer } from "react";
import styles from "./Calculator.module.css";
import { calculatorReducer, initialState } from "./calculatorReducer.ts";
import { actionFromKey } from "./keys.ts";
import { Display } from "./Display.tsx";
import { Keypad } from "./Keypad.tsx";

export function Calculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const action = actionFromKey(event.key);
      if (!action) return;
      event.preventDefault();
      dispatch(action);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <section className={styles.calculator} aria-label="Calculator">
      <Display expression={state.expression} error={state.error} />
      <Keypad onAction={dispatch} />
    </section>
  );
}
