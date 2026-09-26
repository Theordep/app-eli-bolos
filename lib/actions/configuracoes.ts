"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { db } from "@/lib/db";
import { configuracoes } from "@/lib/db/schema";
import { parseBRLToCentavos, parseDecimal } from "@/lib/currency";

const ConfiguracoesSchema = z.object({
  metaSalarioMensalCentavos: z
    .number({ error: "Digite a meta de salário." })
    .nonnegative({ error: "Não pode ser negativo." }),
  horasTrabalhoMes: z
    .number({ error: "Digite as horas trabalhadas no mês." })
    .positive({ error: "Precisa ser maior que zero." }),
  taxaPerdaPercentual: z
    .number({ error: "Digite a taxa de perda." })
    .nonnegative({ error: "Não pode ser negativo." }),
  custoInvisivelPercentual: z
    .number({ error: "Digite a taxa de gás/luz/água." })
    .nonnegative({ error: "Não pode ser negativo." }),
  margemLucroPadraoPercentual: z
    .number({ error: "Digite a margem de lucro." })
    .nonnegative({ error: "Não pode ser negativo." }),
});

export type ConfiguracoesState = { error: string } | undefined;

export async function saveConfiguracoes(
  _state: ConfiguracoesState,
  formData: FormData,
): Promise<ConfiguracoesState> {
  const validated = ConfiguracoesSchema.safeParse({
    metaSalarioMensalCentavos: parseBRLToCentavos(
      String(formData.get("metaSalarioMensalCentavos") ?? ""),
    ),
    horasTrabalhoMes: parseDecimal(String(formData.get("horasTrabalhoMes") ?? "")),
    taxaPerdaPercentual: parseDecimal(String(formData.get("taxaPerdaPercentual") ?? "")),
    custoInvisivelPercentual: parseDecimal(
      String(formData.get("custoInvisivelPercentual") ?? ""),
    ),
    margemLucroPadraoPercentual: parseDecimal(
      String(formData.get("margemLucroPadraoPercentual") ?? ""),
    ),
  });

  if (!validated.success) {
    return { error: "Confira os campos destacados." };
  }

  const data = validated.data;

  await db.insert(configuracoes).values({
    metaSalarioMensalCentavos: data.metaSalarioMensalCentavos,
    horasTrabalhoMes: String(data.horasTrabalhoMes),
    taxaPerdaPercentual: String(data.taxaPerdaPercentual),
    custoInvisivelPercentual: String(data.custoInvisivelPercentual),
    margemLucroPadraoPercentual: String(data.margemLucroPadraoPercentual),
  });

  redirect("/configuracoes");
}
