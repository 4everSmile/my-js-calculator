import styles from "./Calculator.module.css";

type DisplayProps = {
  expression: string;
  error: string | null;
};

export function Display({ expression, error }: DisplayProps) {
  return (
    <div className={styles.display}>
      <output className={styles.expression} aria-live="polite" aria-label="Display">
        {expression || "0"}
      </output>
      <p className={styles.error} role="alert">
        {error}
      </p>
    </div>
  );
}
