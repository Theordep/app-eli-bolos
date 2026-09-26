"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import * as z from "zod";
import { db } from "@/lib/db";
import { insumoHistoricoPrecos, insumos } from "@/lib/db/schema";
import { parseBRLToCentavos, parseDecimal } from "@/lib/currency";
import { requireUser } from "@/lib/auth";

const InsumoSchema = z.object({
  nome: z.string().trim().min(1, { error: "Digite um nome." }),
  tipo: z.enum(["ingrediente", "embalagem"], { error: "Escolha o tipo." }),
  unidadeBase: z.enum(["g", "ml", "unidade"], { error: "Escolha a unidade." }),
  embalagemQuantidadeBase: z
    .number({ error: "Digite a quantidade da embalagem." })
    .positive({ error: "A quantidade precisa ser maior que zero." }),
  embalagemPrecoCentavos: z
    .number({ error: "Digite o preço da embalagem." })
    .nonnegative({ error: "O preço não pode ser negativo." }),
});

export type InsumoState = { error: string; fieldErrors?: Record<string, string> } | undefined;

function parseForm(formData: FormData) {
  const quantidade = parseDecimal(String(formData.get("embalagemQuantidadeBase") ?? ""));
  const preco = parseBRLToCentavos(String(formData.get("embalagemPrecoCentavos") ?? ""));

  return InsumoSchema.safeParse({
    nome: formData.get("nome"),
    tipo: formData.get("tipo"),
    unidadeBase: formData.get("unidadeBase"),
    embalagemQuantidadeBase: quantidade ?? Number.NaN,
    embalagemPrecoCentavos: preco ?? Number.NaN,
  });
}

export async function createInsumo(
  _state: InsumoState,
  formData: FormData,
): Promise<InsumoState> {
  await requireUser();
  const validated = parseForm(formData);

  if (!validated.success) {
    return { error: "Confira os campos destacados." };
  }

  const data = validated.data;

  const [insumo] = await db
    .insert(insumos)
    .values({ ...data, embalagemQuantidadeBase: String(data.embalagemQuantidadeBase) })
    .returning({ id: insumos.id });

  await db.insert(insumoHistoricoPrecos).values({
    insumoId: insumo.id,
    precoCentavos: data.embalagemPrecoCentavos,
    origem: "ajuste_manual",
  });

  redirect("/insumos");
}

export async function updateInsumo(
  insumoId: string,
  _state: InsumoState,
  formData: FormData,
): Promise<InsumoState> {
  await requireUser();
  const validated = parseForm(formData);

  if (!validated.success) {
    return { error: "Confira os campos destacados." };
  }

  const data = validated.data;

  const [existing] = await db
    .select({
      precoCentavos: insumos.embalagemPrecoCentavos,
      quantidadeBase: insumos.embalagemQuantidadeBase,
    })
    .from(insumos)
    .where(eq(insumos.id, insumoId));

  await db
    .update(insumos)
    .set({ ...data, embalagemQuantidadeBase: String(data.embalagemQuantidadeBase) })
    .where(eq(insumos.id, insumoId));

  const mudouPreco = existing && existing.precoCentavos !== data.embalagemPrecoCentavos;
  const mudouQuantidade =
    existing && Number(existing.quantidadeBase) !== data.embalagemQuantidadeBase;

  if (mudouPreco || mudouQuantidade) {
    await db.insert(insumoHistoricoPrecos).values({
      insumoId,
      precoCentavos: data.embalagemPrecoCentavos,
      origem: "ajuste_manual",
    });
  }

  redirect("/insumos");
}

export async function deleteInsumo(insumoId: string): Promise<{ error?: string }> {
  await requireUser();

  try {
    await db.delete(insumos).where(eq(insumos.id, insumoId));
  } catch {
    return {
      error:
        "Não dá pra apagar esse insumo porque ele já está usado em alguma ficha técnica ou compra.",
    };
  }

  return {};
}
