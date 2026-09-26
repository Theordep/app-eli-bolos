"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProduto } from "@/lib/actions/produtos";

export function DeleteProdutoButton({
  produtoId,
  produtoNome,
}: {
  produtoId: string;
  produtoNome: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Apagar "${produtoNome}"? Essa ação não pode ser desfeita.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteProduto(produtoId);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      router.push("/produtos");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Apagar ${produtoNome}`}
      className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="size-4" aria-hidden />
    </button>
  );
}
