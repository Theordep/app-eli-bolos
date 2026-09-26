import { boolean, integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_helpers";
import { modoVendaEnum } from "./enums";
import { configuracoes } from "./configuracoes";
import { insumos } from "./insumos";

// Ficha técnica — cabeçalho. `modoVenda` define a "unidade de venda" (1kg ou 1 unidade) em que
// toda a ficha técnica é expressa. Sem mão de obra aqui: ela não escala com quantidade, é sempre
// digitada por pedido (ver pedidoItens em ./pedidos.ts).
export const produtos = pgTable("produtos", {
  id: id(),
  nome: text("nome").notNull(),
  modoVenda: modoVendaEnum("modo_venda").notNull(),
  tamanhoLotePadrao: integer("tamanho_lote_padrao"),
  tempoPreparoEstimadoMinutos: integer("tempo_preparo_estimado_minutos").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  ...timestamps,
});

// Quantidade de insumo por "1 unidade de venda" do produto (1kg ou 1 unidade, conforme modoVenda).
export const receitaItens = pgTable("receita_itens", {
  id: id(),
  produtoId: uuid("produto_id")
    .notNull()
    .references(() => produtos.id, { onDelete: "cascade" }),
  insumoId: uuid("insumo_id")
    .notNull()
    .references(() => insumos.id),
  quantidadeUtilizada: numeric("quantidade_utilizada", { precision: 12, scale: 3 }).notNull(),
});

// Custo direto (ingredientes + perda + invisível) fotografado por unidade de venda — SEM mão de
// obra e SEM margem, que só existem quando existe um pedido real (ver pedidoItens).
export const produtoCustoSnapshot = pgTable("produto_custo_snapshot", {
  id: id(),
  produtoId: uuid("produto_id")
    .notNull()
    .references(() => produtos.id, { onDelete: "cascade" }),
  configuracaoId: uuid("configuracao_id")
    .notNull()
    .references(() => configuracoes.id),
  custoIngredientesCentavos: integer("custo_ingredientes_centavos").notNull(),
  custoPerdaCentavos: integer("custo_perda_centavos").notNull(),
  custoInvisivelCentavos: integer("custo_invisivel_centavos").notNull(),
  custoDiretoTotalCentavos: integer("custo_direto_total_centavos").notNull(),
  calculadoEm: timestamp("calculado_em", { withTimezone: true }).notNull().defaultNow(),
});
