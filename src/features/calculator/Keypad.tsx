import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalculatorAction } from "./calculatorReducer";
import { KEYPAD } from "./keys";

type KeypadProps = {
  onAction: (action: CalculatorAction) => void;
};

export const Keypad = memo(function Keypad({ onAction }: KeypadProps) {
  return (
    <div className="grid grid-cols-5 gap-x-2.5 gap-y-3.5 sm:gap-x-3 sm:gap-y-4">
      {KEYPAD.map((key) => (
        <Button
          key={key.label}
          type="button"
          variant="bare"
          data-tone={key.tone}
          aria-label={key.ariaLabel}
          className={cn(
            "calc-key aspect-square h-auto rounded-full p-0 font-semibold tracking-tight",
            /[A-Z]{2}/.test(key.label) ? "text-base sm:text-lg" : "text-2xl sm:text-3xl",
          )}
          onClick={() => onAction(key.action)}
        >
          {key.label}
        </Button>
      ))}
    </div>
  );
});
