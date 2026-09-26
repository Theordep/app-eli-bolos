"use client";

import { useActionState } from "react";
import { addPagamento } from "@/lib/actions/pedidos";

export function PagamentoForm({ pedidoId }: { pedidoId: string }) {
  const [state, formAction, pending] = useActionState(
    addPagamento.bind(null, pedidoId),
    undefined,
  );

  return (
    <form action={formAction} className="space-y-2 rounded-xl border border-dashed border-border p-3.5">
      <p className="text-sm font-medium text-foreground">Registrar pagamento</p>

      <div className="flex items-center gap-2">
        <select
          name="tipo"
          defaultValue="sinal"
          className="rounded-lg border border-input bg-card px-2.5 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          <option value="sinal">Sinal</option>
          <option value="saldo">Saldo</option>
          <option value="outro">Outro</option>
        </select>

        <input
          name="valorCentavos"
          type="text"
          inputMode="decimal"
          placeholder="Valor, ex.: 50,00"
          required
          className="min-w-0 flex-1 rounded-lg border border-input bg-card px-2.5 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <select
        name="formaPagamento"
        defaultValue="pix"
        className="w-full rounded-lg border border-input bg-card px-2.5 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
      >
        <option value="pix">Pix</option>
        <option value="dinheiro">Dinheiro</option>
        <option value="cartao">Cartão</option>
        <option value="outro">Outro</option>
      </select>

      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-secondary py-2 text-sm font-medium text-secondary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Registrando…" : "Registrar"}
      </button>
    </form>
  );
}
