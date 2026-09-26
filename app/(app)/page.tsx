import Link from "next/link";
import { Package } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 pt-16 text-center">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Oi, Eli!
      </h1>
      <p className="text-sm text-muted-foreground">
        O resumo do mês vai aparecer aqui em breve. Por enquanto, comece
        cadastrando os ingredientes e embalagens que você usa.
      </p>

      <Link
        href="/insumos"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        <Package className="size-4" aria-hidden />
        Ver insumos
      </Link>
    </div>
  );
}
