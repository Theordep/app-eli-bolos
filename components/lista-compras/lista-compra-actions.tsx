"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { concluirListaCompra, deletarListaCompra } from "@/lib/actions/listas-compra";

export function ListaCompraActions({
  listaCompraId,
  status,
}: {
  listaCompraId: string;
  status: "rascunho" | "concluida";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleConcluir() {
    startTransition(async () => {
      await concluirListaCompra(listaCompraId);
      router.refresh();
    });
  }

  function handleApagar() {
    if (!window.confirm("Apagar esta lista de compras?")) return;
    startTransition(async () => {
      await deletarListaCompra(listaCompraId);
      router.push("/lista-compras");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      {status === "rascunho" && (
        <button
          type="button"
          onClick={handleConcluir}
          disabled={isPending}
          className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          Marcar como concluída
        </button>
      )}
      <button
        type="button"
        onClick={handleApagar}
        disabled={isPending}
        className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50"
      >
        Apagar
      </button>
    </div>
  );
}
