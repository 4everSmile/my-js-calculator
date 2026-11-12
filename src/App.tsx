import owl from "@/assets/owl.png";
import { Calculator } from "@/features/calculator/Calculator";

export function App() {
  return (
    <main className="flex flex-col items-center gap-6 px-4 pt-8 pb-16">
      <img src={owl} alt="" width={160} height={160} className="size-40" />
      <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">My JS Calculator</h1>
      <Calculator />
    </main>
  );
}
