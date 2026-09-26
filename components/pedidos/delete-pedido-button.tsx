"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deletePedido } from "@/lib/actions/pedidos";

export function DeletePedidoButton({ pedidoId }: { pedidoId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("Apagar este pedido? Essa ação não pode ser desfeita.")) return;

    startTransition(async () => {
      const result = await deletePedido(pedidoId);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      router.push("/pedidos");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="size-4" aria-hidden />
      Apagar pedido
    </button>
  );
}
