import { db } from "@/lib/db";
import { insumos } from "@/lib/db/schema";
import { CompraForm } from "@/components/compras/compra-form";

export default async function NovaCompraPage() {
  const lista = await db
    .select({ id: insumos.id, nome: insumos.nome, unidadeBase: insumos.unidadeBase })
    .from(insumos)
    .orderBy(insumos.nome);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 font-heading text-xl font-semibold text-foreground">
        Gastei no mercado
      </h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Registra qualquer gasto — compra de insumo ou despesa diversa.
      </p>
      <CompraForm insumos={lista} />
    </div>
  );
}
