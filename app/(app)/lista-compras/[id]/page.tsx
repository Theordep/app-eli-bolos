import { notFound } from "next/navigation";
import { getListaCompra, getListaCompraItens } from "@/lib/db/queries/listas-compra";
import { ListaCompraItemRow } from "@/components/lista-compras/lista-compra-item-row";
import { ListaCompraActions } from "@/components/lista-compras/lista-compra-actions";
import { formatCentavosToBRL } from "@/lib/currency";

function formatData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default async function ListaCompraDetalhePage({
  params,
}: PageProps<"/lista-compras/[id]">) {
  const { id } = await params;

  const lista = await getListaCompra(id);
  if (!lista) {
    notFound();
  }

  const itens = await getListaCompraItens(id);
  const totalEstimado = itens.reduce((soma, item) => soma + item.precoEstimadoCentavos, 0);

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div>
        <h1 className="font-heading text-xl font-semibold text-foreground">
          {formatData(lista.dataInicioPeriodo)} – {formatData(lista.dataFimPeriodo)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {lista.status === "concluida" ? "Concluída" : "Em aberto"}
        </p>
      </div>

      <ul className="space-y-2">
        {itens.map((item) => (
          <ListaCompraItemRow key={item.id} item={item} listaCompraId={lista.id} />
        ))}
      </ul>

      <div className="flex items-baseline justify-between rounded-xl bg-secondary p-3.5">
        <span className="text-sm font-medium text-secondary-foreground">Total estimado</span>
        <span className="font-heading text-lg font-semibold text-secondary-foreground">
          {formatCentavosToBRL(totalEstimado)}
        </span>
      </div>

      <ListaCompraActions listaCompraId={lista.id} status={lista.status} />
    </div>
  );
}
