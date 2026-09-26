"use client";

import { useActionState } from "react";
import type { InsumoState } from "@/lib/actions/insumos";

type InsumoFormValues = {
  nome: string;
  tipo: "ingrediente" | "embalagem";
  unidadeBase: "g" | "ml" | "unidade";
  embalagemQuantidadeBase: string;
  embalagemPrecoCentavos: string;
};

export function InsumoForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (state: InsumoState, formData: FormData) => Promise<InsumoState>;
  defaultValues?: InsumoFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-foreground">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          placeholder="Ex.: Leite condensado"
          defaultValue={defaultValues?.nome}
          required
          className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="tipo" className="text-sm font-medium text-foreground">
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            defaultValue={defaultValues?.tipo ?? "ingrediente"}
            className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          >
            <option value="ingrediente">Ingrediente</option>
            <option value="embalagem">Embalagem</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="unidadeBase" className="text-sm font-medium text-foreground">
            Unidade
          </label>
          <select
            id="unidadeBase"
            name="unidadeBase"
            defaultValue={defaultValues?.unidadeBase ?? "g"}
            className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          >
            <option value="g">Gramas (g)</option>
            <option value="ml">Mililitros (ml)</option>
            <option value="unidade">Unidade</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor="embalagemQuantidadeBase"
            className="text-sm font-medium text-foreground"
          >
            Quantidade na embalagem
          </label>
          <input
            id="embalagemQuantidadeBase"
            name="embalagemQuantidadeBase"
            type="text"
            inputMode="decimal"
            placeholder="Ex.: 395"
            defaultValue={defaultValues?.embalagemQuantidadeBase}
            required
            className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="embalagemPrecoCentavos"
            className="text-sm font-medium text-foreground"
          >
            Preço pago
          </label>
          <input
            id="embalagemPrecoCentavos"
            name="embalagemPrecoCentavos"
            type="text"
            inputMode="decimal"
            placeholder="Ex.: 6,90"
            defaultValue={defaultValues?.embalagemPrecoCentavos}
            required
            className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
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
