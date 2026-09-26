import { integer, numeric, pgTable, timestamp } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_helpers";

// Versionada (append-only): nunca dar UPDATE numa linha existente, só inserir uma nova
// com vigenteDesde mais recente. A "config atual" é sempre a de vigenteDesde mais recente.
export const configuracoes = pgTable("configuracoes", {
  id: id(),
  vigenteDesde: timestamp("vigente_desde", { withTimezone: true }).notNull().defaultNow(),
  metaSalarioMensalCentavos: integer("meta_salario_mensal_centavos").notNull(),
  horasTrabalhoMes: numeric("horas_trabalho_mes", { precision: 6, scale: 2 }).notNull(),
  taxaPerdaPercentual: numeric("taxa_perda_percentual", { precision: 5, scale: 2 })
    .notNull()
    .default("10"),
  custoInvisivelPercentual: numeric("custo_invisivel_percentual", { precision: 5, scale: 2 })
    .notNull()
    .default("15"),
  margemLucroPadraoPercentual: numeric("margem_lucro_padrao_percentual", {
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default("25"),
  sinalMinimoPercentual: numeric("sinal_minimo_percentual", { precision: 5, scale: 2 })
    .notNull()
    .default("50"),
  ...timestamps,
});
