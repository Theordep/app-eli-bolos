import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  insumos,
  listasCompra,
  listasCompraItens,
  pedidoItens,
  pedidos,
  receitaItens,
} from "@/lib/db/schema";

/**
 * Soma, por insumo, quanto é necessário pros pedidos confirmados/em produção com entrega no
 * período — ver docs/01-modelo-dados.md §8. Agregado em JS (não em SQL) porque `quantidade` e
 * `quantidadeUtilizada` são `numeric` (vêm como string do Postgres).
 */
export async function getInsumosNecessarios(dataInicio: string, dataFim: string) {
  const linhas = await db
    .select({
      insumoId: receitaItens.insumoId,
      quantidadePedido: pedidoItens.quantidade,
      quantidadeReceita: receitaItens.quantidadeUtilizada,
    })
    .from(pedidoItens)
    .innerJoin(pedidos, eq(pedidoItens.pedidoId, pedidos.id))
    .innerJoin(receitaItens, eq(receitaItens.produtoId, pedidoItens.produtoId))
    .where(
      and(
        inArray(pedidos.status, ["confirmado", "producao"]),
        gte(pedidos.dataEntregaPrevista, dataInicio),
        lte(pedidos.dataEntregaPrevista, dataFim),
      ),
    );

  const quantidadePorInsumo = new Map<string, number>();
  for (const linha of linhas) {
    const quantidade = Number(linha.quantidadePedido) * Number(linha.quantidadeReceita);
    quantidadePorInsumo.set(
      linha.insumoId,
      (quantidadePorInsumo.get(linha.insumoId) ?? 0) + quantidade,
    );
  }

  if (quantidadePorInsumo.size === 0) return [];

  const infoInsumos = await db
    .select({
      id: insumos.id,
      nome: insumos.nome,
      unidadeBase: insumos.unidadeBase,
      embalagemPrecoCentavos: insumos.embalagemPrecoCentavos,
      embalagemQuantidadeBase: insumos.embalagemQuantidadeBase,
    })
    .from(insumos)
    .where(inArray(insumos.id, [...quantidadePorInsumo.keys()]));

  return infoInsumos
    .map((insumo) => {
      const quantidadeNecessaria = quantidadePorInsumo.get(insumo.id) ?? 0;
      const custoUnitario =
        insumo.embalagemPrecoCentavos / Number(insumo.embalagemQuantidadeBase);
      return {
        insumoId: insumo.id,
        nome: insumo.nome,
        unidadeBase: insumo.unidadeBase,
        quantidadeNecessaria,
        precoEstimadoCentavos: Math.round(quantidadeNecessaria * custoUnitario),
      };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

export async function listListasCompra() {
  return db.select().from(listasCompra).orderBy(desc(listasCompra.dataInicioPeriodo));
}

export async function getListaCompra(id: string) {
  const [lista] = await db.select().from(listasCompra).where(eq(listasCompra.id, id));
  return lista ?? null;
}

export async function getListaCompraItens(listaCompraId: string) {
  return db
    .select({
      id: listasCompraItens.id,
      quantidadeNecessaria: listasCompraItens.quantidadeNecessaria,
      precoEstimadoCentavos: listasCompraItens.precoEstimadoCentavos,
      comprado: listasCompraItens.comprado,
      insumo: { id: insumos.id, nome: insumos.nome, unidadeBase: insumos.unidadeBase },
    })
    .from(listasCompraItens)
    .innerJoin(insumos, eq(listasCompraItens.insumoId, insumos.id))
    .where(eq(listasCompraItens.listaCompraId, listaCompraId))
    .orderBy(asc(insumos.nome));
}

export type ListaCompraItemComInsumo = Awaited<
  ReturnType<typeof getListaCompraItens>
>[number];
