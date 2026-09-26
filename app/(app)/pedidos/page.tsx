import Link from "next/link";
import { Plus } from "lucide-react";
import { listPedidos } from "@/lib/db/queries/pedidos";
import { StatusBadge } from "@/components/pedidos/status-badge";

function formatData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default async function PedidosPage() {
  const lista = await listPedidos();

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold text-foreground">Pedidos</h1>
        <Link
          href="/pedidos/novo"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden />
          Novo
        </Link>
      </div>

      {lista.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhum pedido ainda. Comece criando um orçamento pra um cliente.
        </p>
      ) : (
        <ul className="space-y-2">
          {lista.map((pedido) => (
            <li key={pedido.id}>
              <Link
                href={`/pedidos/${pedido.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{pedido.clienteNome}</p>
                  <p className="text-xs text-muted-foreground">
                    Entrega {formatData(pedido.dataEntregaPrevista)}
                  </p>
                </div>
                <StatusBadge status={pedido.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
