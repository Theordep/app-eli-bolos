import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { insumos, produtos, receitaItens } from "@/lib/db/schema";

export async function listProdutos() {
  return db.query.produtos.findMany({
    orderBy: (produtos, { asc }) => [asc(produtos.nome)],
  });
}

/** Só produtos que já têm ficha técnica (pelo menos 1 ingrediente) — os únicos que dá pra
 * colocar num pedido, já que sem receita não tem como calcular custo. */
export async function listProdutosComFicha() {
  return db
    .selectDistinct({
      id: produtos.id,
      nome: produtos.nome,
      modoVenda: produtos.modoVenda,
      tamanhoLotePadrao: produtos.tamanhoLotePadrao,
      tempoPreparoEstimadoMinutos: produtos.tempoPreparoEstimadoMinutos,
    })
    .from(produtos)
    .innerJoin(receitaItens, eq(receitaItens.produtoId, produtos.id))
    .orderBy(asc(produtos.nome));
}

export async function getProduto(id: string) {
  const [produto] = await db.select().from(produtos).where(eq(produtos.id, id));
  return produto ?? null;
}

/** Itens da ficha técnica já com o insumo correspondente (join manual, sem `relations()`). */
export async function getReceitaItensComInsumo(produtoId: string) {
  return db
    .select({
      id: receitaItens.id,
      quantidadeUtilizada: receitaItens.quantidadeUtilizada,
      insumo: {
        id: insumos.id,
        nome: insumos.nome,
        unidadeBase: insumos.unidadeBase,
        embalagemQuantidadeBase: insumos.embalagemQuantidadeBase,
        embalagemPrecoCentavos: insumos.embalagemPrecoCentavos,
      },
    })
    .from(receitaItens)
    .innerJoin(insumos, eq(receitaItens.insumoId, insumos.id))
    .where(eq(receitaItens.produtoId, produtoId))
    .orderBy(asc(insumos.nome));
}

export type ReceitaItemComInsumo = Awaited<
  ReturnType<typeof getReceitaItensComInsumo>
>[number];
