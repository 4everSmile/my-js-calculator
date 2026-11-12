type DisplayProps = {
  expression: string;
  error: string | null;
};

export function Display({ expression, error }: DisplayProps) {
  return (
    <div className="grid gap-1">
      <output
        aria-live="polite"
        aria-label="Display"
        className="block min-h-14 rounded-md border bg-muted px-4 py-3 text-right font-mono text-3xl break-all"
      >
        {expression || "0"}
      </output>
      <p role="alert" className="min-h-5 text-right text-sm text-destructive">
        {error}
      </p>
    </div>
  );
}
