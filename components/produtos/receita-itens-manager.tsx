"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  addReceitaItem,
  removeReceitaItem,
  updateReceitaItem,
} from "@/lib/actions/produtos";
import { formatCentavosToBRLPreciso } from "@/lib/currency";
import type { ReceitaItemComInsumo } from "@/lib/db/queries/produtos";

const UNIDADE_LABEL: Record<string, string> = { g: "g", ml: "ml", unidade: "un" };

type InsumoOpcao = {
  id: string;
  nome: string;
  unidadeBase: "g" | "ml" | "unidade";
};

export function ReceitaItensManager({
  produtoId,
  modoVenda,
  itens,
  insumosDisponiveis,
}: {
  produtoId: string;
  modoVenda: "kg" | "unidade";
  itens: ReceitaItemComInsumo[];
  insumosDisponiveis: InsumoOpcao[];
}) {
  const unidadeVenda = modoVenda === "kg" ? "1kg" : "1 unidade";
  const jaUsados = new Set(itens.map((item) => item.insumo.id));
  const opcoesRestantes = insumosDisponiveis.filter((i) => !jaUsados.has(i.id));

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Quanto de cada insumo é preciso para produzir <strong>{unidadeVenda}</strong> deste
        produto.
      </p>

      {itens.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Nenhum ingrediente adicionado ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {itens.map((item) => (
            <ReceitaItemRow
              key={item.id}
              item={item}
              produtoId={produtoId}
            />
          ))}
        </ul>
      )}

      {opcoesRestantes.length > 0 ? (
        <AddReceitaItemForm produtoId={produtoId} opcoes={opcoesRestantes} />
      ) : insumosDisponiveis.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Cadastre insumos primeiro para poder montar a ficha técnica.
        </p>
      ) : null}
    </div>
  );
}

function ReceitaItemRow({
  item,
  produtoId,
}: {
  item: ReceitaItemComInsumo;
  produtoId: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateReceitaItem.bind(null, item.id, produtoId),
    undefined,
  );
  const unidade = UNIDADE_LABEL[item.insumo.unidadeBase];
  const quantidade = Number(item.quantidadeUtilizada);
  const custoUnitario =
    item.insumo.embalagemPrecoCentavos / Number(item.insumo.embalagemQuantidadeBase);
  const subtotal = quantidade * custoUnitario;

  async function handleRemove() {
    if (!window.confirm(`Remover "${item.insumo.nome}" desta ficha técnica?`)) return;
    await removeReceitaItem(item.id, produtoId);
    router.refresh();
  }

  return (
    <li className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-medium text-foreground">
          {item.insumo.nome}
        </span>
        <button
          type="button"
          onClick={handleRemove}
          aria-label={`Remover ${item.insumo.nome}`}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>

      <form action={formAction} className="mt-2 flex items-center gap-2">
        <input
          name="quantidadeUtilizada"
          type="text"
          inputMode="decimal"
          defaultValue={item.quantidadeUtilizada}
          className="w-24 rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <span className="text-sm text-muted-foreground">{unidade}</span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-50"
        >
          {pending ? "…" : "Atualizar"}
        </button>
        <span className="ml-auto shrink-0 text-sm text-muted-foreground">
          {formatCentavosToBRLPreciso(subtotal)}
        </span>
      </form>
      {state?.error && <p className="mt-1 text-xs text-destructive">{state.error}</p>}
    </li>
  );
}

function AddReceitaItemForm({
  produtoId,
  opcoes,
}: {
  produtoId: string;
  opcoes: InsumoOpcao[];
}) {
  const [state, formAction, pending] = useActionState(
    addReceitaItem.bind(null, produtoId),
    undefined,
  );
  const [insumoId, setInsumoId] = useState(opcoes[0]?.id ?? "");
  const selecionado = opcoes.find((o) => o.id === insumoId);

  return (
    <form action={formAction} className="space-y-2 rounded-xl border border-dashed border-border p-3">
      <p className="text-sm font-medium text-foreground">Adicionar ingrediente</p>
      <div className="flex items-center gap-2">
        <select
          name="insumoId"
          value={insumoId}
          onChange={(e) => setInsumoId(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-input bg-card px-2.5 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          {opcoes.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome}
            </option>
          ))}
        </select>
        <input
          name="quantidadeUtilizada"
          type="text"
          inputMode="decimal"
          placeholder="Qtd."
          required
          className="w-20 rounded-lg border border-input bg-card px-2.5 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <span className="shrink-0 text-sm text-muted-foreground">
          {selecionado ? UNIDADE_LABEL[selecionado.unidadeBase] : ""}
        </span>
      </div>

      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}

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
