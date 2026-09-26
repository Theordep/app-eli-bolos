import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { formatCentavosToBRL, formatCentavosToBRLPreciso } from "@/lib/currency";
import { DeleteInsumoButton } from "@/components/insumos/delete-insumo-button";

const UNIDADE_LABEL: Record<string, string> = { g: "g", ml: "ml", unidade: "un" };
const TIPO_LABEL: Record<string, string> = {
  ingrediente: "Ingrediente",
  embalagem: "Embalagem",
};

export default async function InsumosPage() {
  const lista = await db.query.insumos.findMany({
    orderBy: (insumos, { asc }) => [asc(insumos.nome)],
  });

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold text-foreground">
          Insumos
        </h1>
        <Link
          href="/insumos/novo"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden />
          Novo
        </Link>
      </div>

      {lista.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhum insumo cadastrado ainda. Comece adicionando um ingrediente ou
          embalagem que você usa nas receitas.
        </p>
      ) : (
        <ul className="space-y-2">
          {lista.map((insumo) => {
            const unidade = UNIDADE_LABEL[insumo.unidadeBase];
            const quantidadeBase = Number(insumo.embalagemQuantidadeBase);
            const custoUnitario = insumo.embalagemPrecoCentavos / quantidadeBase;

            return (
              <li
                key={insumo.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
              >
                <Link href={`/insumos/${insumo.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{insumo.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {TIPO_LABEL[insumo.tipo]} · {formatCentavosToBRL(insumo.embalagemPrecoCentavos)}
                    {" "}
                    ({quantidadeBase} {unidade}) · {formatCentavosToBRLPreciso(custoUnitario)}/{unidade}
                  </p>
                </Link>
                <DeleteInsumoButton insumoId={insumo.id} insumoNome={insumo.nome} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
