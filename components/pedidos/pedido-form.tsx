"use client";

import { useActionState, useState } from "react";
import { createPedido, type PedidoState } from "@/lib/actions/pedidos";
import { PhoneInput } from "@/components/phone-input";

const NOVO_CLIENTE = "__novo__";

export function PedidoForm({
  clientes,
}: {
  clientes: { id: string; nome: string }[];
}) {
  const [state, formAction, pending] = useActionState<PedidoState, FormData>(
    createPedido,
    undefined,
  );
  const [clienteId, setClienteId] = useState("");
  const criandoCliente = clienteId === NOVO_CLIENTE;

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
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          <option value="" disabled>
            Escolha um cliente
          </option>
          <option value={NOVO_CLIENTE}>+ Novo cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      {criandoCliente && (
        <div className="space-y-3 rounded-xl border border-dashed border-border p-3.5">
          <div className="space-y-1.5">
            <label htmlFor="novoClienteNome" className="text-sm font-medium text-foreground">
              Nome do cliente
            </label>
            <input
              id="novoClienteNome"
              name="novoClienteNome"
              type="text"
              required={criandoCliente}
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="novoClienteWhatsapp" className="text-sm font-medium text-foreground">
              WhatsApp (opcional)
            </label>
            <PhoneInput
              id="novoClienteWhatsapp"
              name="novoClienteWhatsapp"
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <p className="text-xs text-muted-foreground">
              Sem pressa — se não preencher agora, fica marcado como pendente na tela de Clientes.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="dataEntregaPrevista" className="text-sm font-medium text-foreground">
          Data de entrega
        </label>
        <input
          id="dataEntregaPrevista"
          name="dataEntregaPrevista"
          type="date"
          required
          className="h-11 w-full appearance-none rounded-xl border border-input bg-card px-3.5 py-0 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
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
