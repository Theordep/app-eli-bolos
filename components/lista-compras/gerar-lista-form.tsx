"use client";

import { useActionState } from "react";
import { gerarListaCompra } from "@/lib/actions/listas-compra";

export function GerarListaForm({
  dataInicioPadrao,
  dataFimPadrao,
}: {
  dataInicioPadrao: string;
  dataFimPadrao: string;
}) {
  const [state, formAction, pending] = useActionState(gerarListaCompra, undefined);

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border bg-card p-3.5">
      <p className="text-sm font-medium text-foreground">Gerar lista pro período</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="dataInicioPeriodo" className="text-xs font-medium text-foreground">
            De
          </label>
          <input
            id="dataInicioPeriodo"
            name="dataInicioPeriodo"
            type="date"
            defaultValue={dataInicioPadrao}
            required
            className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="dataFimPeriodo" className="text-xs font-medium text-foreground">
            Até
          </label>
          <input
            id="dataFimPeriodo"
            name="dataFimPeriodo"
            type="date"
            defaultValue={dataFimPadrao}
            required
            className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Soma os ingredientes dos pedidos confirmados/em produção com entrega nesse período.
      </p>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Gerando…" : "Gerar lista"}
      </button>
    </form>
  );
}
