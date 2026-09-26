import Link from "next/link";
import { Plus } from "lucide-react";
import { listPedidos } from "@/lib/db/queries/pedidos";
import { StatusBadge } from "@/components/pedidos/status-badge";

function formatData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function dataLocalISO(offsetDias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD no fuso local
}

type Pedido = Awaited<ReturnType<typeof listPedidos>>[number];

export default async function PedidosPage() {
  const lista = await listPedidos();

  const hoje = dataLocalISO(0);
  const amanha = dataLocalISO(1);

  const emAndamento = lista.filter(
    (p) => p.status === "confirmado" || p.status === "producao",
  );

  const grupos: { titulo: string; pedidos: Pedido[] }[] = [
    { titulo: "Orçamentos", pedidos: lista.filter((p) => p.status === "orcamento") },
    {
      titulo: "Para hoje",
      pedidos: emAndamento.filter((p) => p.dataEntregaPrevista === hoje),
    },
    {
      titulo: "Para amanhã",
      pedidos: emAndamento.filter((p) => p.dataEntregaPrevista === amanha),
    },
    {
      titulo: "Próximos dias",
      pedidos: emAndamento.filter(
        (p) => p.dataEntregaPrevista !== hoje && p.dataEntregaPrevista !== amanha,
      ),
    },
    {
      titulo: "Entregues",
      pedidos: lista.filter((p) => p.status === "entregue"),
    },
    {
      titulo: "Cancelados",
      pedidos: lista.filter((p) => p.status === "cancelado"),
    },
  ];

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
        <div className="space-y-5">
          {grupos
            .filter((g) => g.pedidos.length > 0)
            .map((grupo) => (
              <div key={grupo.titulo}>
                <h2 className="mb-2 text-sm font-medium text-muted-foreground">
                  {grupo.titulo}
                </h2>
                <ul className="space-y-2">
                  {grupo.pedidos.map((pedido) => (
                    <li key={pedido.id}>
                      <Link
                        href={`/pedidos/${pedido.id}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {pedido.clienteNome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Entrega {formatData(pedido.dataEntregaPrevista)}
                          </p>
                        </div>
                        <StatusBadge status={pedido.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
