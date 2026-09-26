import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { insumos, produtos, receitaItens } from "@/lib/db/schema";

export async function listProdutos() {
  return db.query.produtos.findMany({
    orderBy: (produtos, { asc }) => [asc(produtos.nome)],
  });
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
