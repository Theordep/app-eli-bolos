import { integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_helpers";
import { insumoTipoEnum, origemPrecoEnum, unidadeBaseEnum } from "./enums";

// Ingredientes e embalagens vivem na mesma tabela: ambos são "preço da embalagem / qtd da
// embalagem = custo unitário". `embalagemPrecoCentavos` é sempre o cache do último preço pago
// (atualizado por comprasInsumos, ver lib/db/schema/financeiro.ts).
export const insumos = pgTable("insumos", {
  id: id(),
  nome: text("nome").notNull(),
  tipo: insumoTipoEnum("tipo").notNull(),
  unidadeBase: unidadeBaseEnum("unidade_base").notNull(),
  embalagemQuantidadeBase: numeric("embalagem_quantidade_base", {
    precision: 12,
    scale: 3,
  }).notNull(),
  embalagemPrecoCentavos: integer("embalagem_preco_centavos").notNull(),
  ...timestamps,
});

// Log append-only, nunca editar/apagar uma linha existente.
export const insumoHistoricoPrecos = pgTable("insumo_historico_precos", {
  id: id(),
  insumoId: uuid("insumo_id")
    .notNull()
    .references(() => insumos.id, { onDelete: "cascade" }),
  precoCentavos: integer("preco_centavos").notNull(),
  registradoEm: timestamp("registrado_em", { withTimezone: true }).notNull().defaultNow(),
  origem: origemPrecoEnum("origem").notNull(),
});
