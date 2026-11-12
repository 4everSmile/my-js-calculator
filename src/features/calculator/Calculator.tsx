import { useEffect, useReducer } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { calculatorReducer, initialState } from "./calculatorReducer";
import { Display } from "./Display";
import { Keypad } from "./Keypad";
import { actionFromKey } from "./keys";

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
    <section aria-label="Calculator" className="w-full max-w-sm">
      <Card>
        <CardHeader>
          <Display expression={state.expression} error={state.error} />
        </CardHeader>
        <CardContent>
          <Keypad onAction={dispatch} />
        </CardContent>
      </Card>
    </section>
  );
}
