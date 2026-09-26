import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { configuracoes } from "@/lib/db/schema";

export type ConfiguracaoAtual = typeof configuracoes.$inferSelect;

/** A config vigente é sempre a de `vigenteDesde` mais recente (tabela é append-only). */
export async function getConfiguracaoAtual(): Promise<ConfiguracaoAtual | null> {
  const [config] = await db
    .select()
    .from(configuracoes)
    .orderBy(desc(configuracoes.vigenteDesde))
    .limit(1);

  return config ?? null;
}
