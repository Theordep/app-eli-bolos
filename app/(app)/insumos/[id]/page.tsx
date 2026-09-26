import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { insumos } from "@/lib/db/schema";
import { InsumoForm } from "@/components/insumos/insumo-form";
import { updateInsumo } from "@/lib/actions/insumos";
import { centavosToInputValue } from "@/lib/currency";

export default async function EditarInsumoPage({
  params,
}: PageProps<"/insumos/[id]">) {
  const { id } = await params;

  const [insumo] = await db.select().from(insumos).where(eq(insumos.id, id));

  if (!insumo) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 font-heading text-xl font-semibold text-foreground">
        Editar insumo
      </h1>
      <InsumoForm
        action={updateInsumo.bind(null, insumo.id)}
        submitLabel="Salvar alterações"
        defaultValues={{
          nome: insumo.nome,
          tipo: insumo.tipo,
          unidadeBase: insumo.unidadeBase,
          embalagemQuantidadeBase: String(insumo.embalagemQuantidadeBase),
          embalagemPrecoCentavos: centavosToInputValue(insumo.embalagemPrecoCentavos),
        }}
      />
    </div>
  );
}
