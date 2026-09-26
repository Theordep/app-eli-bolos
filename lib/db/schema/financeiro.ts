import { date, integer, numeric, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_helpers";
import { transacaoCategoriaEnum, transacaoTipoEnum } from "./enums";
import { insumos } from "./insumos";
import { pedidoPagamentos } from "./pedidos";

// "Gastei no Mercado" — ao salvar uma compra com insumoId preenchido, a aplicação deve: (1) criar
// a linha correspondente em transacoesFinanceiras, (2) criar a linha em insumoHistoricoPrecos, e
// (3) atualizar o cache insumos.embalagemPrecoCentavos. Ver docs/01-modelo-dados.md §7.
export const comprasInsumos = pgTable("compras_insumos", {
  id: id(),
  insumoId: uuid("insumo_id").references(() => insumos.id),
  dataCompra: date("data_compra").notNull(),
  quantidadeComprada: numeric("quantidade_comprada", { precision: 12, scale: 3 }),
  valorCentavos: integer("valor_centavos").notNull(),
  observacao: text("observacao"),
  ...timestamps,
});

// Ledger único: toda movimentação de dinheiro real passa por aqui — é a única tabela que o
// dashboard financeiro lê (GROUP BY tipo, categoria).
export const transacoesFinanceiras = pgTable("transacoes_financeiras", {
  id: id(),
  tipo: transacaoTipoEnum("tipo").notNull(),
  categoria: transacaoCategoriaEnum("categoria").notNull(),
  valorCentavos: integer("valor_centavos").notNull(),
  data: date("data").notNull(),
  descricao: text("descricao"),
  pedidoPagamentoId: uuid("pedido_pagamento_id").references(() => pedidoPagamentos.id),
  compraInsumoId: uuid("compra_insumo_id").references(() => comprasInsumos.id),
  ...timestamps,
});
