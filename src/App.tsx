import owl from "./assets/owl.png";
import { Calculator } from "./features/calculator/Calculator.tsx";
import styles from "./App.module.css";

export function App() {
  return (
    <main className={styles.app}>
      <img src={owl} alt="" width={200} height={200} className={styles.logo} />
      <h1 className={styles.title}>My JS Calculator</h1>
      <Calculator />
    </main>
  );
}
