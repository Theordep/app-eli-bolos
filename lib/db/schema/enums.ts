import { pgEnum } from "drizzle-orm/pg-core";

export const insumoTipoEnum = pgEnum("insumo_tipo", ["ingrediente", "embalagem"]);

export const unidadeBaseEnum = pgEnum("unidade_base", ["g", "ml", "unidade"]);

export const origemPrecoEnum = pgEnum("origem_preco", ["compra", "ajuste_manual"]);

export const modoVendaEnum = pgEnum("modo_venda", ["kg", "unidade"]);

export const pedidoStatusEnum = pgEnum("pedido_status", [
  "orcamento",
  "confirmado",
  "producao",
  "entregue",
  "cancelado",
]);

export const pagamentoTipoEnum = pgEnum("pagamento_tipo", ["sinal", "saldo", "outro"]);

export const formaPagamentoEnum = pgEnum("forma_pagamento", [
  "pix",
  "dinheiro",
  "cartao",
  "outro",
]);

export const transacaoTipoEnum = pgEnum("transacao_tipo", ["entrada", "saida"]);

export const transacaoCategoriaEnum = pgEnum("transacao_categoria", [
  "sinal_pedido",
  "saldo_pedido",
  "compra_insumo",
  "compra_diversa",
  "outro",
]);

export const listaCompraStatusEnum = pgEnum("lista_compra_status", ["rascunho", "concluida"]);
