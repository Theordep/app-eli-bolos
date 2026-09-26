"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteCliente } from "@/lib/actions/clientes";

export function DeleteClienteButton({
  clienteId,
  clienteNome,
}: {
  clienteId: string;
  clienteNome: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Apagar "${clienteNome}"? Essa ação não pode ser desfeita.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCliente(clienteId);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Apagar ${clienteNome}`}
      className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="size-4" aria-hidden />
    </button>
  );
}
