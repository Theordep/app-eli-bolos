"use client";

import { useActionState, useState } from "react";
import { addPedidoItem } from "@/lib/actions/pedidos";

type ProdutoOpcao = {
  id: string;
  nome: string;
  modoVenda: "kg" | "unidade";
  tamanhoLotePadrao: number | null;
  tempoPreparoEstimadoMinutos: number;
};

export function AddPedidoItemForm({
  pedidoId,
  produtos,
}: {
  pedidoId: string;
  produtos: ProdutoOpcao[];
}) {
  const [state, formAction, pending] = useActionState(
    addPedidoItem.bind(null, pedidoId),
    undefined,
  );
  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? "");
  const produto = produtos.find((p) => p.id === produtoId);

  if (produtos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Nenhum produto com ficha técnica ainda. Cadastre os ingredientes de um produto antes
        de adicionar ao pedido.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border border-dashed border-border p-3.5"
    >
      <p className="text-sm font-medium text-foreground">Adicionar produto ao pedido</p>

      <div className="space-y-1.5">
        <label htmlFor="produtoId" className="text-sm font-medium text-foreground">
          Produto
        </label>
        <select
          id="produtoId"
          name="produtoId"
          value={produtoId}
          onChange={(e) => setProdutoId(e.target.value)}
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="quantidade" className="text-sm font-medium text-foreground">
          {produto?.modoVenda === "kg" ? "Peso (kg)" : "Quantidade (unidades)"}
        </label>
        <input
          id="quantidade"
          name="quantidade"
          type="text"
          inputMode="decimal"
          placeholder={
            produto?.modoVenda === "kg"
              ? "Ex.: 2.5"
              : String(produto?.tamanhoLotePadrao ?? "Ex.: 12")
          }
          required
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="tempoPreparoMinutos"
          className="text-sm font-medium text-foreground"
        >
          Tempo de preparo pra esse pedido
        </label>
        <div className="relative">
          <input
            id="tempoPreparoMinutos"
            name="tempoPreparoMinutos"
            type="text"
            inputMode="numeric"
            defaultValue={produto?.tempoPreparoEstimadoMinutos}
            key={produtoId}
            required
            className="w-full rounded-lg border border-input bg-card px-3 py-2 pr-16 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
            min
          </span>
        </div>

        {produto?.modoVenda === "unidade" && (
          <label className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
            <input type="checkbox" name="tempoEPorUnidade" className="size-4" />
            Esse tempo é de <strong>uma peça só</strong> (não do lote inteiro)
          </label>
        )}
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-secondary py-2 text-sm font-medium text-secondary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Adicionando…" : "Adicionar"}
      </button>
    </form>
  );
}
