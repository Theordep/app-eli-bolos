"use client";

import { useActionState, useState } from "react";

type ProdutoState = { error: string } | undefined;

type ProdutoFormValues = {
  nome: string;
  modoVenda: "kg" | "unidade";
  tamanhoLotePadrao: string;
  tempoPreparoEstimadoMinutos: string;
};

export function ProdutoForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (state: ProdutoState, formData: FormData) => Promise<ProdutoState>;
  defaultValues?: ProdutoFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [modoVenda, setModoVenda] = useState<"kg" | "unidade">(
    defaultValues?.modoVenda ?? "kg",
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-foreground">
          Nome do sabor/produto
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          placeholder="Ex.: Bolo de Chocolate"
          defaultValue={defaultValues?.nome}
          required
          className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="modoVenda" className="text-sm font-medium text-foreground">
          Vendido por
        </label>
        <select
          id="modoVenda"
          name="modoVenda"
          value={modoVenda}
          onChange={(e) => setModoVenda(e.target.value as "kg" | "unidade")}
          className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          <option value="kg">Quilo (kg)</option>
          <option value="unidade">Unidade</option>
        </select>
      </div>

      {modoVenda === "unidade" && (
        <div className="space-y-1.5">
          <label
            htmlFor="tamanhoLotePadrao"
            className="text-sm font-medium text-foreground"
          >
            Tamanho do lote (opcional)
          </label>
          <input
            id="tamanhoLotePadrao"
            name="tamanhoLotePadrao"
            type="text"
            inputMode="numeric"
            placeholder="Ex.: 12"
            defaultValue={defaultValues?.tamanhoLotePadrao}
            className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          <p className="text-xs text-muted-foreground">
            Sugestão de quantidade quando vender em lote fechado (ex.: caixa com 12).
            Sempre pode escolher outra quantidade na hora do pedido.
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="tempoPreparoEstimadoMinutos"
          className="text-sm font-medium text-foreground"
        >
          Tempo estimado de preparo
        </label>
        <div className="relative">
          <input
            id="tempoPreparoEstimadoMinutos"
            name="tempoPreparoEstimadoMinutos"
            type="text"
            inputMode="numeric"
            placeholder="Ex.: 90"
            defaultValue={defaultValues?.tempoPreparoEstimadoMinutos}
            required
            className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 pr-16 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted-foreground">
            min
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Só uma sugestão inicial — em cada pedido você pode digitar o tempo real daquela vez.
        </p>
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
        {pending ? "Salvando…" : submitLabel}
      </button>
    </form>
  );
}
