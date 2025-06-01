
import { GenCraftForm } from "@/components/app/gencraft-form";

export default function HomePage() {
  return (
    <main className="w-full"> {/* The GenCraftForm will handle its own container/padding */}
      <GenCraftForm />
    </main>
  );
}
