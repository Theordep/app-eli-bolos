"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { removePedidoItem, updatePedidoItemPreco } from "@/lib/actions/pedidos";
import { formatCentavosToBRL, centavosToInputValue } from "@/lib/currency";
import type { PedidoItemComProduto } from "@/lib/db/queries/pedidos";

export function PedidoItemRow({
  item,
  pedidoId,
}: {
  item: PedidoItemComProduto;
  pedidoId: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updatePedidoItemPreco.bind(null, item.id, pedidoId),
    undefined,
  );

  const unidade = item.produto.modoVenda === "kg" ? "kg" : "un";

  async function handleRemove() {
    if (!window.confirm(`Remover "${item.produto.nome}" deste pedido?`)) return;
    await removePedidoItem(item.id, pedidoId);
    router.refresh();
  }

  return (
    <li className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{item.produto.nome}</p>
          <p className="text-xs text-muted-foreground">
            {Number(item.quantidade)} {unidade} · {item.tempoPreparoMinutos} min
            {item.tempoEPorUnidade ? "/un" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          aria-label={`Remover ${item.produto.nome}`}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>

      <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <dt>Custo de produção</dt>
          <dd>{formatCentavosToBRL(item.custoProducaoTotalCentavos)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Margem de lucro</dt>
          <dd>{formatCentavosToBRL(item.margemLucroCentavos)}</dd>
        </div>
        <div className="flex justify-between font-medium text-foreground">
          <dt>Preço sugerido</dt>
          <dd>{formatCentavosToBRL(item.precoVendaSugeridoCentavos)}</dd>
        </div>
      </dl>

      <form action={formAction} className="mt-2 flex items-center gap-2">
        <label htmlFor={`preco-${item.id}`} className="text-sm font-medium text-foreground">
          Preço combinado
        </label>
        <input
          id={`preco-${item.id}`}
          name="precoVendaFinalCentavos"
          type="text"
          inputMode="decimal"
          defaultValue={centavosToInputValue(item.precoVendaFinalCentavos)}
          className="ml-auto w-24 rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-50"
        >
          {pending ? "…" : "Salvar"}
        </button>
      </form>
      {state?.error && <p className="mt-1 text-xs text-destructive">{state.error}</p>}
    </li>
  );
}
