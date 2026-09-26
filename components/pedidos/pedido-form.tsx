"use client";

import { useActionState } from "react";
import { createPedido, type PedidoState } from "@/lib/actions/pedidos";

export function PedidoForm({
  clientes,
}: {
  clientes: { id: string; nome: string }[];
}) {
  const [state, formAction, pending] = useActionState<PedidoState, FormData>(
    createPedido,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="clienteId" className="text-sm font-medium text-foreground">
          Cliente
        </label>
        <select
          id="clienteId"
          name="clienteId"
          required
          defaultValue=""
          className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          <option value="" disabled>
            Escolha um cliente
          </option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="dataEntregaPrevista" className="text-sm font-medium text-foreground">
          Data de entrega
        </label>
        <input
          id="dataEntregaPrevista"
          name="dataEntregaPrevista"
          type="date"
          required
          className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="observacoes" className="text-sm font-medium text-foreground">
          Observações (opcional)
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={2}
          className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary py-2.5 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Criando…" : "Criar orçamento"}
      </button>
    </form>
  );
}
