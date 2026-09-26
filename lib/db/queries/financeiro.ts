import { and, desc, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { transacoesFinanceiras } from "@/lib/db/schema";

/** Primeiro e último dia do mês (formato YYYY-MM-DD), a partir de um "YYYY-MM". */
function limitesDoMes(anoMes: string) {
  const [ano, mes] = anoMes.split("-").map(Number);
  const inicio = `${anoMes}-01`;
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const fim = `${anoMes}-${String(ultimoDia).padStart(2, "0")}`;
  return { inicio, fim };
}

export async function getResumoMensal(anoMes: string) {
  const { inicio, fim } = limitesDoMes(anoMes);

  const transacoes = await db
    .select()
    .from(transacoesFinanceiras)
    .where(
      and(gte(transacoesFinanceiras.data, inicio), lte(transacoesFinanceiras.data, fim)),
    )
    .orderBy(desc(transacoesFinanceiras.data));

  const entradasCentavos = transacoes
    .filter((t) => t.tipo === "entrada")
    .reduce((soma, t) => soma + t.valorCentavos, 0);

  const saidasCentavos = transacoes
    .filter((t) => t.tipo === "saida")
    .reduce((soma, t) => soma + t.valorCentavos, 0);

  return {
    transacoes,
    entradasCentavos,
    saidasCentavos,
    saldoCentavos: entradasCentavos - saidasCentavos,
  };
}
