"use client";

import { useActionState } from "react";
import type { ClienteState } from "@/lib/actions/clientes";
import { PhoneInput } from "@/components/phone-input";

type ClienteFormValues = {
  nome: string;
  telefoneWhatsapp?: string | null;
  enderecoEntrega?: string | null;
  observacoes?: string | null;
};

export function ClienteForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (state: ClienteState, formData: FormData) => Promise<ClienteState>;
  defaultValues?: ClienteFormValues;
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
          defaultValue={defaultValues?.nome}
          required
          className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="telefoneWhatsapp" className="text-sm font-medium text-foreground">
          WhatsApp (opcional)
        </label>
        <PhoneInput
          id="telefoneWhatsapp"
          name="telefoneWhatsapp"
          defaultValue={defaultValues?.telefoneWhatsapp}
          className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="enderecoEntrega" className="text-sm font-medium text-foreground">
          Endereço de entrega (opcional)
        </label>
        <input
          id="enderecoEntrega"
          name="enderecoEntrega"
          type="text"
          defaultValue={defaultValues?.enderecoEntrega ?? ""}
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
          defaultValue={defaultValues?.observacoes ?? ""}
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
        {pending ? "Salvando…" : submitLabel}
      </button>
    </form>
  );
}
