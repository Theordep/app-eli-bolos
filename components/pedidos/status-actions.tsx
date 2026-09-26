"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { transitionPedidoStatus } from "@/lib/actions/pedidos";
import { formatCentavosToBRL } from "@/lib/currency";

type Status = "orcamento" | "confirmado" | "producao" | "entregue" | "cancelado";
type StatusAlvo = Exclude<Status, "orcamento">;

export function StatusActions({
  pedidoId,
  status,
  totalPedidoCentavos,
  saldoDevedorCentavos,
}: {
  pedidoId: string;
  status: Status;
  totalPedidoCentavos: number;
  saldoDevedorCentavos: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function mudar(novoStatus: StatusAlvo, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;

    startTransition(async () => {
      const result = await transitionPedidoStatus(pedidoId, novoStatus);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (status === "entregue") {
    return <p className="text-sm text-muted-foreground">Pedido concluído.</p>;
  }

  if (status === "cancelado") {
    return <p className="text-sm text-muted-foreground">Pedido cancelado.</p>;
  }

  const podeConfirmar = status === "orcamento" && totalPedidoCentavos > 0;

  return (
    <div className="space-y-2">
      {status === "orcamento" && (
        <>
          {totalPedidoCentavos <= 0 && (
            <p className="text-xs text-muted-foreground">
              Adicione pelo menos um produto pra poder confirmar.
            </p>
          )}
          <button
            type="button"
            disabled={!podeConfirmar || isPending}
            onClick={() => mudar("confirmado")}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
          >
            Confirmar pedido
          </button>
        </>
      )}

      {status === "confirmado" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => mudar("producao")}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          Iniciar produção
        </button>
      )}

      {(status === "confirmado" || status === "producao") && (
        <button
          type="button"
          disabled={saldoDevedorCentavos > 0 || isPending}
          onClick={() => mudar("entregue")}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
        >
          {saldoDevedorCentavos > 0
            ? `Falta receber ${formatCentavosToBRL(saldoDevedorCentavos)} pra entregar`
            : "Marcar como entregue"}
        </button>
      )}

      <button
        type="button"
        disabled={isPending}
        onClick={() => mudar("cancelado", "Cancelar este pedido?")}
        className="w-full rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50"
      >
        Cancelar pedido
      </button>
    </div>
  );
}
