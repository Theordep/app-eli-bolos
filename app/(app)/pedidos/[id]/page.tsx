import { notFound } from "next/navigation";
import { getPedido, getPedidoItens } from "@/lib/db/queries/pedidos";
import { listProdutosComFicha } from "@/lib/db/queries/produtos";
import { StatusBadge } from "@/components/pedidos/status-badge";
import { PedidoItemRow } from "@/components/pedidos/pedido-item-row";
import { AddPedidoItemForm } from "@/components/pedidos/add-pedido-item-form";
import { DeletePedidoButton } from "@/components/pedidos/delete-pedido-button";
import { formatCentavosToBRL } from "@/lib/currency";

function formatData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default async function PedidoDetalhePage({
  params,
}: PageProps<"/pedidos/[id]">) {
  const { id } = await params;

  const pedido = await getPedido(id);
  if (!pedido) {
    notFound();
  }

  const [itens, produtosDisponiveis] = await Promise.all([
    getPedidoItens(id),
    listProdutosComFicha(),
  ]);

  const totalFinal = itens.reduce((soma, item) => soma + item.precoVendaFinalCentavos, 0);
  const totalCusto = itens.reduce(
    (soma, item) => soma + item.custoProducaoTotalCentavos,
    0,
  );

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div>
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-heading text-xl font-semibold text-foreground">
            {pedido.cliente.nome}
          </h1>
          <StatusBadge status={pedido.status} />
        </div>
        <p className="text-sm text-muted-foreground">{pedido.cliente.telefoneWhatsapp}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Entrega em {formatData(pedido.dataEntregaPrevista)}
        </p>
        {pedido.observacoes && (
          <p className="mt-1 text-sm text-muted-foreground">{pedido.observacoes}</p>
        )}
      </div>

      <div>
        <h2 className="mb-2 font-heading text-lg font-semibold text-foreground">Itens</h2>

        {itens.length === 0 ? (
          <p className="mb-3 rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Nenhum produto adicionado ainda.
          </p>
        ) : (
          <ul className="mb-3 space-y-2">
            {itens.map((item) => (
              <PedidoItemRow key={item.id} item={item} pedidoId={pedido.id} />
            ))}
          </ul>
        )}

        <AddPedidoItemForm pedidoId={pedido.id} produtos={produtosDisponiveis} />
      </div>

      {itens.length > 0 && (
        <div className="space-y-1 rounded-xl bg-secondary p-3.5 text-sm">
          <div className="flex justify-between text-secondary-foreground/80">
            <span>Custo de produção total</span>
            <span>{formatCentavosToBRL(totalCusto)}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-medium text-secondary-foreground">Total combinado</span>
            <span className="font-heading text-lg font-semibold text-secondary-foreground">
              {formatCentavosToBRL(totalFinal)}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <DeletePedidoButton pedidoId={pedido.id} />
      </div>
    </div>
  );
}
