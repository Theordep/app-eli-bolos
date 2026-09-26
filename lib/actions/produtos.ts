"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { db } from "@/lib/db";
import { produtos, receitaItens } from "@/lib/db/schema";
import { parseDecimal } from "@/lib/currency";

const ProdutoSchema = z.object({
  nome: z.string().trim().min(1, { error: "Digite um nome." }),
  modoVenda: z.enum(["kg", "unidade"], { error: "Escolha o modo de venda." }),
  tamanhoLotePadrao: z.number().int().positive().nullable(),
  tempoPreparoEstimadoMinutos: z
    .number({ error: "Digite o tempo estimado de preparo." })
    .int()
    .positive({ error: "Precisa ser maior que zero." }),
});

export type ProdutoState = { error: string } | undefined;

function parseProdutoForm(formData: FormData) {
  const loteRaw = String(formData.get("tamanhoLotePadrao") ?? "").trim();
  const tempoRaw = parseDecimal(String(formData.get("tempoPreparoEstimadoMinutos") ?? ""));

  return ProdutoSchema.safeParse({
    nome: formData.get("nome"),
    modoVenda: formData.get("modoVenda"),
    tamanhoLotePadrao: loteRaw ? Math.round(Number(loteRaw)) : null,
    tempoPreparoEstimadoMinutos: tempoRaw ? Math.round(tempoRaw) : Number.NaN,
  });
}

export async function createProduto(
  _state: ProdutoState,
  formData: FormData,
): Promise<ProdutoState> {
  const validated = parseProdutoForm(formData);

  if (!validated.success) {
    return { error: "Confira os campos destacados." };
  }

  const [produto] = await db
    .insert(produtos)
    .values(validated.data)
    .returning({ id: produtos.id });

  redirect(`/produtos/${produto.id}`);
}

export async function updateProduto(
  produtoId: string,
  _state: ProdutoState,
  formData: FormData,
): Promise<ProdutoState> {
  const validated = parseProdutoForm(formData);

  if (!validated.success) {
    return { error: "Confira os campos destacados." };
  }

  await db.update(produtos).set(validated.data).where(eq(produtos.id, produtoId));

  revalidatePath(`/produtos/${produtoId}`);
  return undefined;
}

export async function deleteProduto(produtoId: string): Promise<{ error?: string }> {
  try {
    await db.delete(produtos).where(eq(produtos.id, produtoId));
  } catch {
    return {
      error: "Não dá pra apagar esse produto porque ele já está usado em algum pedido.",
    };
  }

  return {};
}

const ReceitaItemSchema = z.object({
  insumoId: z.uuid({ error: "Escolha um insumo." }),
  quantidadeUtilizada: z
    .number({ error: "Digite a quantidade." })
    .positive({ error: "Precisa ser maior que zero." }),
});

export type ReceitaItemState = { error: string } | undefined;

export async function addReceitaItem(
  produtoId: string,
  _state: ReceitaItemState,
  formData: FormData,
): Promise<ReceitaItemState> {
  const validated = ReceitaItemSchema.safeParse({
    insumoId: formData.get("insumoId"),
    quantidadeUtilizada: parseDecimal(String(formData.get("quantidadeUtilizada") ?? "")),
  });

  if (!validated.success) {
    return { error: "Escolha um insumo e digite a quantidade." };
  }

  await db.insert(receitaItens).values({
    produtoId,
    insumoId: validated.data.insumoId,
    quantidadeUtilizada: String(validated.data.quantidadeUtilizada),
  });

  revalidatePath(`/produtos/${produtoId}`);
  return undefined;
}

export async function updateReceitaItem(
  receitaItemId: string,
  produtoId: string,
  _state: ReceitaItemState,
  formData: FormData,
): Promise<ReceitaItemState> {
  const quantidade = parseDecimal(String(formData.get("quantidadeUtilizada") ?? ""));

  if (!quantidade) {
    return { error: "Digite uma quantidade válida." };
  }

  await db
    .update(receitaItens)
    .set({ quantidadeUtilizada: String(quantidade) })
    .where(eq(receitaItens.id, receitaItemId));

  revalidatePath(`/produtos/${produtoId}`);
  return undefined;
}

export async function removeReceitaItem(receitaItemId: string, produtoId: string) {
  await db.delete(receitaItens).where(eq(receitaItens.id, receitaItemId));
  revalidatePath(`/produtos/${produtoId}`);
}
