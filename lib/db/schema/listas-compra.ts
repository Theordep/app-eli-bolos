import { boolean, date, integer, numeric, pgTable, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_helpers";
import { listaCompraStatusEnum } from "./enums";
import { insumos } from "./insumos";

export const listasCompra = pgTable("listas_compra", {
  id: id(),
  dataInicioPeriodo: date("data_inicio_periodo").notNull(),
  dataFimPeriodo: date("data_fim_periodo").notNull(),
  status: listaCompraStatusEnum("status").notNull().default("rascunho"),
  ...timestamps,
});

// Gerado agregando pedidoItens.quantidade * receitaItens.quantidadeUtilizada dos pedidos
// confirmados/em produção no período — ver docs/01-modelo-dados.md §8.
export const listasCompraItens = pgTable("listas_compra_itens", {
  id: id(),
  listaCompraId: uuid("lista_compra_id")
    .notNull()
    .references(() => listasCompra.id, { onDelete: "cascade" }),
  insumoId: uuid("insumo_id")
    .notNull()
    .references(() => insumos.id),
  quantidadeNecessaria: numeric("quantidade_necessaria", { precision: 12, scale: 3 }).notNull(),
  precoEstimadoCentavos: integer("preco_estimado_centavos").notNull(),
  comprado: boolean("comprado").notNull().default(false),
});
