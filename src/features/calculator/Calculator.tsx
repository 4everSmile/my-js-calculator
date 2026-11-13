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
      <Card className="gap-5 rounded-[2.5rem] border-0 bg-calc-body py-5 shadow-[0_2px_0_rgb(255_255_255/0.7)_inset,0_-6px_0_var(--calc-bezel)_inset,0_24px_40px_-12px_var(--shadow-color)]">
        <CardHeader className="px-5">
          <Display
            expression={state.expression}
            error={state.error}
            hasMemory={state.memory !== 0}
            isResult={state.showingResult}
          />
        </CardHeader>
        <CardContent className="px-4 pb-3 sm:px-5">
          <Keypad onAction={dispatch} />
        </CardContent>
      </Card>
    </section>
  );
}
