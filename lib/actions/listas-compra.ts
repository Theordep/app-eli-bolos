"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { db } from "@/lib/db";
import { listasCompra, listasCompraItens } from "@/lib/db/schema";
import { getInsumosNecessarios } from "@/lib/db/queries/listas-compra";

const GerarListaSchema = z.object({
  dataInicioPeriodo: z.string().min(1, { error: "Escolha a data de início." }),
  dataFimPeriodo: z.string().min(1, { error: "Escolha a data de fim." }),
});

export type GerarListaState = { error: string } | undefined;

export async function gerarListaCompra(
  _state: GerarListaState,
  formData: FormData,
): Promise<GerarListaState> {
  const validated = GerarListaSchema.safeParse({
    dataInicioPeriodo: formData.get("dataInicioPeriodo"),
    dataFimPeriodo: formData.get("dataFimPeriodo"),
  });

  if (!validated.success) {
    return { error: "Confira as datas." };
  }

  const { dataInicioPeriodo, dataFimPeriodo } = validated.data;

  if (dataFimPeriodo < dataInicioPeriodo) {
    return { error: "A data de fim precisa ser depois da data de início." };
  }

  const necessarios = await getInsumosNecessarios(dataInicioPeriodo, dataFimPeriodo);

  if (necessarios.length === 0) {
    return {
      error: "Nenhum pedido confirmado/em produção com entrega nesse período — nada pra comprar.",
    };
  }

  const [lista] = await db
    .insert(listasCompra)
    .values({ dataInicioPeriodo, dataFimPeriodo, status: "rascunho" })
    .returning({ id: listasCompra.id });

  await db.insert(listasCompraItens).values(
    necessarios.map((item) => ({
      listaCompraId: lista.id,
      insumoId: item.insumoId,
      quantidadeNecessaria: String(item.quantidadeNecessaria),
      precoEstimadoCentavos: item.precoEstimadoCentavos,
    })),
  );

  redirect(`/lista-compras/${lista.id}`);
}

export async function toggleItemComprado(
  itemId: string,
  listaCompraId: string,
  comprado: boolean,
) {
  await db
    .update(listasCompraItens)
    .set({ comprado })
    .where(eq(listasCompraItens.id, itemId));

  revalidatePath(`/lista-compras/${listaCompraId}`);
}

export async function concluirListaCompra(listaCompraId: string) {
  await db
    .update(listasCompra)
    .set({ status: "concluida" })
    .where(eq(listasCompra.id, listaCompraId));

  revalidatePath(`/lista-compras/${listaCompraId}`);
  revalidatePath("/lista-compras");
}

export async function deletarListaCompra(listaCompraId: string) {
  await db.delete(listasCompra).where(eq(listasCompra.id, listaCompraId));
  revalidatePath("/lista-compras");
}
