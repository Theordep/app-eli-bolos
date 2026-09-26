"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleItemComprado } from "@/lib/actions/listas-compra";
import { formatCentavosToBRL } from "@/lib/currency";
import type { ListaCompraItemComInsumo } from "@/lib/db/queries/listas-compra";

const UNIDADE_LABEL: Record<string, string> = { g: "g", ml: "ml", unidade: "un" };

export function ListaCompraItemRow({
  item,
  listaCompraId,
}: {
  item: ListaCompraItemComInsumo;
  listaCompraId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleItemComprado(item.id, listaCompraId, !item.comprado);
      router.refresh();
    });
  }

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <input
        type="checkbox"
        checked={item.comprado}
        onChange={handleToggle}
        disabled={isPending}
        className="size-5 shrink-0"
        aria-label={`Marcar ${item.insumo.nome} como comprado`}
      />
      <div className={`min-w-0 flex-1 ${item.comprado ? "opacity-50 line-through" : ""}`}>
        <p className="truncate font-medium text-foreground">{item.insumo.nome}</p>
        <p className="text-xs text-muted-foreground">
          {Number(item.quantidadeNecessaria)} {UNIDADE_LABEL[item.insumo.unidadeBase]}
        </p>
      </div>
      <span
        className={`shrink-0 text-sm ${item.comprado ? "text-muted-foreground line-through" : "text-foreground"}`}
      >
        {formatCentavosToBRL(item.precoEstimadoCentavos)}
      </span>
    </li>
  );
}
