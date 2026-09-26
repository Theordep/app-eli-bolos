import { InsumoForm } from "@/components/insumos/insumo-form";
import { createInsumo } from "@/lib/actions/insumos";

export default function NovoInsumoPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 font-heading text-xl font-semibold text-foreground">
        Novo insumo
      </h1>
      <InsumoForm action={createInsumo} submitLabel="Adicionar" />
    </div>
  );
}
