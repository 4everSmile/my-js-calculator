import owl from "@/assets/owl.png";
import { Calculator } from "@/features/calculator/Calculator";

export function App() {
  return (
    <main className="flex flex-col items-center gap-6 px-4 pt-8 pb-16">
      <img
        src={owl}
        alt=""
        width={256}
        height={256}
        className="owl-mascot size-56 sm:size-64"
      />
      <Calculator />
    </main>
  );
}
