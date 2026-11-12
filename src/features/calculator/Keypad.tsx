import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalculatorAction } from "./calculatorReducer";
import { KEYPAD, type KeyDef } from "./keys";

const VARIANT: Record<NonNullable<KeyDef["variant"]> | "digit", "default" | "secondary" | "outline" | "destructive"> = {
  digit: "outline",
  operator: "secondary",
  clear: "destructive",
  equals: "default",
};

type KeypadProps = {
  onAction: (action: CalculatorAction) => void;
};

export const Keypad = memo(function Keypad({ onAction }: KeypadProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {KEYPAD.map((key) => (
        <Button
          key={key.label}
          type="button"
          variant={VARIANT[key.variant ?? "digit"]}
          aria-label={key.ariaLabel}
          className={cn("h-16 text-2xl", key.wide && "col-span-2")}
          onClick={() => onAction(key.action)}
        >
          {key.label}
        </Button>
      ))}
    </div>
  );
});
