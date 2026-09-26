import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clientes, pedidoItens, pedidoPagamentos, pedidos, produtos } from "@/lib/db/schema";

export async function listPedidos() {
  return db
    .select({
      id: pedidos.id,
      status: pedidos.status,
      dataEntregaPrevista: pedidos.dataEntregaPrevista,
      clienteNome: clientes.nome,
    })
    .from(pedidos)
    .innerJoin(clientes, eq(pedidos.clienteId, clientes.id))
    .orderBy(asc(pedidos.dataEntregaPrevista));
}

export async function getPedido(id: string) {
  const [pedido] = await db
    .select({
      id: pedidos.id,
      status: pedidos.status,
      dataPedido: pedidos.dataPedido,
      dataEntregaPrevista: pedidos.dataEntregaPrevista,
      observacoes: pedidos.observacoes,
      cliente: {
        id: clientes.id,
        nome: clientes.nome,
        telefoneWhatsapp: clientes.telefoneWhatsapp,
      },
    })
    .from(pedidos)
    .innerJoin(clientes, eq(pedidos.clienteId, clientes.id))
    .where(eq(pedidos.id, id));

  return pedido ?? null;
}

export async function getPedidoItens(pedidoId: string) {
  return db
    .select({
      id: pedidoItens.id,
      quantidade: pedidoItens.quantidade,
      tempoEPorUnidade: pedidoItens.tempoEPorUnidade,
      tempoPreparoMinutos: pedidoItens.tempoPreparoMinutos,
      custoIngredientesCentavos: pedidoItens.custoIngredientesCentavos,
      custoMaoObraCentavos: pedidoItens.custoMaoObraCentavos,
      custoProducaoTotalCentavos: pedidoItens.custoProducaoTotalCentavos,
      margemLucroCentavos: pedidoItens.margemLucroCentavos,
      precoVendaSugeridoCentavos: pedidoItens.precoVendaSugeridoCentavos,
      precoVendaFinalCentavos: pedidoItens.precoVendaFinalCentavos,
      produto: {
        id: produtos.id,
        nome: produtos.nome,
        modoVenda: produtos.modoVenda,
      },
    })
    .from(pedidoItens)
    .innerJoin(produtos, eq(pedidoItens.produtoId, produtos.id))
    .where(eq(pedidoItens.pedidoId, pedidoId));
}

export type PedidoItemComProduto = Awaited<ReturnType<typeof getPedidoItens>>[number];

export async function getPagamentos(pedidoId: string) {
  return db
    .select()
    .from(pedidoPagamentos)
    .where(eq(pedidoPagamentos.pedidoId, pedidoId))
    .orderBy(asc(pedidoPagamentos.dataPagamento));
}

/** Total combinado (soma dos preços finais dos itens), total já pago, e o que falta receber. */
export async function getResumoFinanceiro(pedidoId: string) {
  const [itens, pagamentos] = await Promise.all([
    db
      .select({ precoVendaFinalCentavos: pedidoItens.precoVendaFinalCentavos })
      .from(pedidoItens)
      .where(eq(pedidoItens.pedidoId, pedidoId)),
    db
      .select({ valorCentavos: pedidoPagamentos.valorCentavos })
      .from(pedidoPagamentos)
      .where(eq(pedidoPagamentos.pedidoId, pedidoId)),
  ]);

  const totalPedidoCentavos = itens.reduce((soma, i) => soma + i.precoVendaFinalCentavos, 0);
  const totalPagoCentavos = pagamentos.reduce((soma, p) => soma + p.valorCentavos, 0);

  return {
    totalPedidoCentavos,
    totalPagoCentavos,
    saldoDevedorCentavos: totalPedidoCentavos - totalPagoCentavos,
  };
}
