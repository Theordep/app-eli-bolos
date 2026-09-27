"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import * as z from "zod";
import { db } from "@/lib/db";
import { comprasInsumos, insumoHistoricoPrecos, insumos, transacoesFinanceiras } from "@/lib/db/schema";
import { parseBRLToCentavos, parseDecimal } from "@/lib/currency";
import { hojeISO } from "@/lib/date";
import { requireUser } from "@/lib/auth";

const CompraSchema = z.object({
  insumoId: z.uuid().optional(),
  valorCentavos: z
    .number({ error: "Digite o valor." })
    .positive({ error: "Precisa ser maior que zero." }),
  quantidadeComprada: z.number().positive().nullable(),
  observacao: z.string().trim().optional(),
});

export type CompraState = { error: string } | undefined;

export async function createCompra(
  _state: CompraState,
  formData: FormData,
): Promise<CompraState> {
  await requireUser();
  const insumoIdRaw = String(formData.get("insumoId") ?? "").trim();

  const validated = CompraSchema.safeParse({
    insumoId: insumoIdRaw || undefined,
    valorCentavos: parseBRLToCentavos(String(formData.get("valorCentavos") ?? "")),
    quantidadeComprada: parseDecimal(String(formData.get("quantidadeComprada") ?? "")),
    observacao: formData.get("observacao") || undefined,
  });

  if (!validated.success) {
    return { error: "Confira os campos destacados." };
  }

  const { insumoId, valorCentavos, quantidadeComprada, observacao } = validated.data;
  const hoje = hojeISO();

  const [compra] = await db
    .insert(comprasInsumos)
    .values({
      insumoId: insumoId ?? null,
      dataCompra: hoje,
      quantidadeComprada: quantidadeComprada ? String(quantidadeComprada) : null,
      valorCentavos,
      observacao,
    })
    .returning({ id: comprasInsumos.id });

  let insumoNome: string | undefined;

  if (insumoId) {
    const [atualizado] = await db
      .update(insumos)
      .set({ embalagemPrecoCentavos: valorCentavos })
      .where(eq(insumos.id, insumoId))
      .returning({ nome: insumos.nome });
    insumoNome = atualizado?.nome;

    await db.insert(insumoHistoricoPrecos).values({
      insumoId,
      precoCentavos: valorCentavos,
      origem: "compra",
    });
  }

  await db.insert(transacoesFinanceiras).values({
    tipo: "saida",
    categoria: insumoId ? "compra_insumo" : "compra_diversa",
    valorCentavos,
    data: hoje,
    descricao: observacao || insumoNome || "Gasto diverso",
    compraInsumoId: compra.id,
  });

  redirect("/");
}
