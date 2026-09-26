"use client";

import { useActionState, useState } from "react";
import { createCompra } from "@/lib/actions/compras";

type InsumoOpcao = { id: string; nome: string; unidadeBase: "g" | "ml" | "unidade" };

const UNIDADE_LABEL: Record<string, string> = { g: "g", ml: "ml", unidade: "un" };

export function CompraForm({ insumos }: { insumos: InsumoOpcao[] }) {
  const [state, formAction, pending] = useActionState(createCompra, undefined);
  const [insumoId, setInsumoId] = useState("");
  const selecionado = insumos.find((i) => i.id === insumoId);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="insumoId" className="text-sm font-medium text-foreground">
          Insumo (opcional)
        </label>
        <select
          id="insumoId"
          name="insumoId"
          value={insumoId}
          onChange={(e) => setInsumoId(e.target.value)}
          className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          <option value="">Gasto diverso (sem insumo)</option>
          {insumos.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nome}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Escolhendo um insumo, o preço dele é atualizado automaticamente com o valor pago aqui.
        </p>
      </div>

      {selecionado && (
        <div className="space-y-1.5">
          <label htmlFor="quantidadeComprada" className="text-sm font-medium text-foreground">
            Quantidade comprada (opcional)
          </label>
          <div className="relative">
            <input
              id="quantidadeComprada"
              name="quantidadeComprada"
              type="text"
              inputMode="decimal"
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 pr-14 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted-foreground">
              {UNIDADE_LABEL[selecionado.unidadeBase]}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Só pra ficar registrado quanto você comprou — o preço por {UNIDADE_LABEL[selecionado.unidadeBase]}
            {" "}continua sendo calculado com a quantidade da embalagem cadastrada em Insumos.
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="valorCentavos" className="text-sm font-medium text-foreground">
          Valor pago
        </label>
        <input
          id="valorCentavos"
          name="valorCentavos"
          type="text"
          inputMode="decimal"
          placeholder="Ex.: 25,90"
          required
          className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="observacao" className="text-sm font-medium text-foreground">
          Observação (opcional)
        </label>
        <input
          id="observacao"
          name="observacao"
          type="text"
          placeholder="Ex.: Mercado Extra"
          className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
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
        {pending ? "Registrando…" : "Registrar gasto"}
      </button>
    </form>
  );
}
