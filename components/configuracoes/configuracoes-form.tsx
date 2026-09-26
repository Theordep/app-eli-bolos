"use client";

import { useActionState } from "react";
import { saveConfiguracoes } from "@/lib/actions/configuracoes";

type Field = {
  name: string;
  label: string;
  hint: string;
  suffix?: string;
};

const FIELDS: Field[] = [
  {
    name: "metaSalarioMensalCentavos",
    label: "Meta de salário por mês",
    hint: "Quanto você quer tirar de salário todo mês, sem contar o lucro da empresa.",
  },
  {
    name: "horasTrabalhoMes",
    label: "Horas trabalhadas por mês",
    hint: "Usado pra achar o valor da sua hora de trabalho.",
    suffix: "h",
  },
  {
    name: "taxaPerdaPercentual",
    label: "Taxa de perda",
    hint: "Desperdício e erro de medida — soma esse % sobre o custo dos ingredientes.",
    suffix: "%",
  },
  {
    name: "custoInvisivelPercentual",
    label: "Gás, luz e água",
    hint: "% sobre o custo dos ingredientes pra cobrir essas contas.",
    suffix: "%",
  },
  {
    name: "margemLucroPadraoPercentual",
    label: "Margem de lucro padrão",
    hint: "Sugestão de lucro da empresa em cima do custo de produção (20–30% é comum).",
    suffix: "%",
  },
  {
    name: "sinalMinimoPercentual",
    label: "Sinal mínimo pra confirmar pedido",
    hint: "% do valor total que precisa entrar pra o pedido sair do orçamento.",
    suffix: "%",
  },
];

export function ConfiguracoesForm({
  defaultValues,
}: {
  defaultValues: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(saveConfiguracoes, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {FIELDS.map((field) => (
        <div key={field.name} className="space-y-1.5">
          <label htmlFor={field.name} className="text-sm font-medium text-foreground">
            {field.label}
          </label>
          <div className="relative">
            <input
              id={field.name}
              name={field.name}
              type="text"
              inputMode="decimal"
              defaultValue={defaultValues[field.name]}
              required
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            {field.suffix && (
              <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted-foreground">
                {field.suffix}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{field.hint}</p>
        </div>
      ))}

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
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
