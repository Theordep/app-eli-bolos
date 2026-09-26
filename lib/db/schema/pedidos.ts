import { boolean, date, integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_helpers";
import { formaPagamentoEnum, pagamentoTipoEnum, pedidoStatusEnum } from "./enums";
import { clientes } from "./clientes";
import { produtos, produtoCustoSnapshot } from "./produtos";

export const pedidos = pgTable("pedidos", {
  id: id(),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => clientes.id),
  status: pedidoStatusEnum("status").notNull().default("orcamento"),
  dataPedido: date("data_pedido").notNull(),
  dataEntregaPrevista: date("data_entrega_prevista").notNull(),
  observacoes: text("observacoes"),
  ...timestamps,
});

// Congela, num único lugar, ingredientes (escalado por `quantidade`) + mão de obra (calculada do
// tempo digitado, nunca de uma fórmula automática) + margem + preço final combinado. Ver a nota de
// `tempoEPorUnidade` em docs/01-modelo-dados.md §5.1 antes de mexer na lógica de cálculo.
export const pedidoItens = pgTable("pedido_itens", {
  id: id(),
  pedidoId: uuid("pedido_id")
    .notNull()
    .references(() => pedidos.id, { onDelete: "cascade" }),
  produtoId: uuid("produto_id")
    .notNull()
    .references(() => produtos.id),
  produtoCustoSnapshotId: uuid("produto_custo_snapshot_id")
    .notNull()
    .references(() => produtoCustoSnapshot.id),
  quantidade: numeric("quantidade", { precision: 12, scale: 3 }).notNull(),
  tempoEPorUnidade: boolean("tempo_e_por_unidade").notNull().default(false),
  tempoPreparoMinutos: integer("tempo_preparo_minutos").notNull(),
  custoIngredientesCentavos: integer("custo_ingredientes_centavos").notNull(),
  custoMaoObraCentavos: integer("custo_mao_obra_centavos").notNull(),
  custoProducaoTotalCentavos: integer("custo_producao_total_centavos").notNull(),
  margemLucroCentavos: integer("margem_lucro_centavos").notNull(),
  precoVendaSugeridoCentavos: integer("preco_venda_sugerido_centavos").notNull(),
  precoVendaFinalCentavos: integer("preco_venda_final_centavos").notNull(),
});

export const pedidoPagamentos = pgTable("pedido_pagamentos", {
  id: id(),
  pedidoId: uuid("pedido_id")
    .notNull()
    .references(() => pedidos.id, { onDelete: "cascade" }),
  tipo: pagamentoTipoEnum("tipo").notNull(),
  valorCentavos: integer("valor_centavos").notNull(),
  formaPagamento: formaPagamentoEnum("forma_pagamento").notNull(),
  dataPagamento: timestamp("data_pagamento", { withTimezone: true }).notNull().defaultNow(),
  confirmado: boolean("confirmado").notNull().default(false),
});
