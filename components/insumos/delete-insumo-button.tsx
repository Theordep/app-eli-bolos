"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteInsumo } from "@/lib/actions/insumos";

export function DeleteInsumoButton({
  insumoId,
  insumoNome,
}: {
  insumoId: string;
  insumoNome: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm(`Apagar "${insumoNome}"? Essa ação não pode ser desfeita.`)) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteInsumo(insumoId);
      if (result.error) {
        setError(result.error);
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
      aria-label={`Apagar ${insumoNome}`}
      className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
      title={error ?? undefined}
    >
      <Trash2 className="size-4" aria-hidden />
    </button>
  );
}
