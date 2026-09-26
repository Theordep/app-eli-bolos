"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { db } from "@/lib/db";
import {
  pedidoItens,
  pedidoPagamentos,
  pedidos,
  produtoCustoSnapshot,
  transacoesFinanceiras,
} from "@/lib/db/schema";
import { getProduto, getReceitaItensComInsumo } from "@/lib/db/queries/produtos";
import { getConfiguracaoAtual } from "@/lib/db/queries/configuracoes";
import { getPedido, getResumoFinanceiro } from "@/lib/db/queries/pedidos";
import { calcularCustoDireto } from "@/lib/produto-custo";
import { parseBRLToCentavos, parseDecimal } from "@/lib/currency";
import { hojeISO } from "@/lib/date";
import { requireUser } from "@/lib/auth";

const PedidoSchema = z.object({
  clienteId: z.uuid({ error: "Escolha um cliente." }),
  dataEntregaPrevista: z.string().min(1, { error: "Escolha a data de entrega." }),
  observacoes: z.string().trim().optional(),
});

export type PedidoState = { error: string } | undefined;

export async function createPedido(
  _state: PedidoState,
  formData: FormData,
): Promise<PedidoState> {
  await requireUser();
  const validated = PedidoSchema.safeParse({
    clienteId: formData.get("clienteId"),
    dataEntregaPrevista: formData.get("dataEntregaPrevista"),
    observacoes: formData.get("observacoes") || undefined,
  });

  if (!validated.success) {
    return { error: "Confira os campos destacados." };
  }

  const hoje = hojeISO();

  const [pedido] = await db
    .insert(pedidos)
    .values({ ...validated.data, dataPedido: hoje })
    .returning({ id: pedidos.id });

  redirect(`/pedidos/${pedido.id}`);
}

export async function deletePedido(pedidoId: string): Promise<{ error?: string }> {
  await requireUser();

  try {
    await db.delete(pedidos).where(eq(pedidos.id, pedidoId));
  } catch {
    return { error: "Não foi possível apagar esse pedido." };
  }
  return {};
}

const PedidoItemSchema = z.object({
  produtoId: z.uuid({ error: "Escolha um produto." }),
  quantidade: z
    .number({ error: "Digite a quantidade." })
    .positive({ error: "Precisa ser maior que zero." }),
  tempoPreparoMinutos: z
    .number({ error: "Digite o tempo de preparo." })
    .int()
    .positive({ error: "Precisa ser maior que zero." }),
  tempoEPorUnidade: z.boolean(),
});

export type PedidoItemState = { error: string } | undefined;

export async function addPedidoItem(
  pedidoId: string,
  _state: PedidoItemState,
  formData: FormData,
): Promise<PedidoItemState> {
  await requireUser();

  const pedido = await getPedido(pedidoId);
  if (!pedido) {
    return { error: "Pedido não encontrado." };
  }
  if (pedido.status !== "orcamento") {
    return { error: "Só dá pra alterar os itens enquanto o pedido está em orçamento." };
  }

  const validated = PedidoItemSchema.safeParse({
    produtoId: formData.get("produtoId"),
    quantidade: parseDecimal(String(formData.get("quantidade") ?? "")),
    tempoPreparoMinutos: Math.round(
      parseDecimal(String(formData.get("tempoPreparoMinutos") ?? "")) ?? Number.NaN,
    ),
    tempoEPorUnidade: formData.get("tempoEPorUnidade") === "on",
  });

  if (!validated.success) {
    return { error: "Confira os campos destacados." };
  }

  const { produtoId, quantidade, tempoPreparoMinutos, tempoEPorUnidade } = validated.data;

  const config = await getConfiguracaoAtual();
  if (!config) {
    return { error: "Configure a precificação (Configurações) antes de montar um pedido." };
  }

  const produto = await getProduto(produtoId);
  if (!produto) {
    return { error: "Produto não encontrado." };
  }

  if (produto.modoVenda === "unidade" && !Number.isInteger(quantidade)) {
    return { error: "Esse produto é vendido por unidade — a quantidade precisa ser um número inteiro." };
  }

  const itensReceita = await getReceitaItensComInsumo(produtoId);
  if (itensReceita.length === 0) {
    return { error: "Esse produto ainda não tem ficha técnica cadastrada." };
  }

  const custoDireto = calcularCustoDireto(itensReceita, config);

  const [snapshot] = await db
    .insert(produtoCustoSnapshot)
    .values({
      produtoId,
      configuracaoId: config.id,
      custoIngredientesCentavos: Math.round(custoDireto.custoIngredientesCentavos),
      custoPerdaCentavos: Math.round(custoDireto.custoPerdaCentavos),
      custoInvisivelCentavos: Math.round(custoDireto.custoInvisivelCentavos),
      custoDiretoTotalCentavos: Math.round(custoDireto.custoDiretoTotalCentavos),
    })
    .returning({ id: produtoCustoSnapshot.id });

  const tempoTotalMinutos = tempoEPorUnidade
    ? tempoPreparoMinutos * quantidade
    : tempoPreparoMinutos;

  const valorHoraCentavos = config.metaSalarioMensalCentavos / Number(config.horasTrabalhoMes);

  const custoIngredientesCentavos = Math.round(
    quantidade * custoDireto.custoDiretoTotalCentavos,
  );
  const custoMaoObraCentavos = Math.round(valorHoraCentavos * (tempoTotalMinutos / 60));
  const custoProducaoTotalCentavos = custoIngredientesCentavos + custoMaoObraCentavos;
  const margemLucroCentavos = Math.round(
    custoProducaoTotalCentavos * (Number(config.margemLucroPadraoPercentual) / 100),
  );
  const precoVendaSugeridoCentavos = custoProducaoTotalCentavos + margemLucroCentavos;

  await db.insert(pedidoItens).values({
    pedidoId,
    produtoId,
    produtoCustoSnapshotId: snapshot.id,
    quantidade: String(quantidade),
    tempoEPorUnidade,
    tempoPreparoMinutos,
    custoIngredientesCentavos,
    custoMaoObraCentavos,
    custoProducaoTotalCentavos,
    margemLucroCentavos,
    precoVendaSugeridoCentavos,
    precoVendaFinalCentavos: precoVendaSugeridoCentavos,
  });

  revalidatePath(`/pedidos/${pedidoId}`);
  return undefined;
}

export type PrecoFinalState = { error: string } | undefined;

export async function updatePedidoItemPreco(
  itemId: string,
  pedidoId: string,
  _state: PrecoFinalState,
  formData: FormData,
): Promise<PrecoFinalState> {
  await requireUser();

  const pedido = await getPedido(pedidoId);
  if (!pedido) {
    return { error: "Pedido não encontrado." };
  }
  if (pedido.status !== "orcamento") {
    return { error: "Só dá pra alterar o preço enquanto o pedido está em orçamento." };
  }

  const preco = parseBRLToCentavos(String(formData.get("precoVendaFinalCentavos") ?? ""));

  if (preco === null) {
    return { error: "Digite um preço válido." };
  }

  await db
    .update(pedidoItens)
    .set({ precoVendaFinalCentavos: preco })
    .where(eq(pedidoItens.id, itemId));

  revalidatePath(`/pedidos/${pedidoId}`);
  return undefined;
}

export async function removePedidoItem(
  itemId: string,
  pedidoId: string,
): Promise<{ error?: string }> {
  await requireUser();

  const pedido = await getPedido(pedidoId);
  if (!pedido) {
    return { error: "Pedido não encontrado." };
  }
  if (pedido.status !== "orcamento") {
    return { error: "Só dá pra remover itens enquanto o pedido está em orçamento." };
  }

  await db.delete(pedidoItens).where(eq(pedidoItens.id, itemId));
  revalidatePath(`/pedidos/${pedidoId}`);
  return {};
}

const PagamentoSchema = z.object({
  valorCentavos: z
    .number({ error: "Digite o valor." })
    .positive({ error: "Precisa ser maior que zero." }),
  formaPagamento: z.enum(["pix", "dinheiro", "cartao", "outro"], {
    error: "Escolha a forma de pagamento.",
  }),
});

export type PagamentoState = { error: string } | undefined;

export async function addPagamento(
  pedidoId: string,
  _state: PagamentoState,
  formData: FormData,
): Promise<PagamentoState> {
  await requireUser();

  const pedido = await getPedido(pedidoId);
  if (!pedido) {
    return { error: "Pedido não encontrado." };
  }
  if (pedido.status === "cancelado") {
    return { error: "Esse pedido foi cancelado — não dá pra registrar pagamento nele." };
  }

  const validated = PagamentoSchema.safeParse({
    valorCentavos: parseBRLToCentavos(String(formData.get("valorCentavos") ?? "")),
    formaPagamento: formData.get("formaPagamento"),
  });

  if (!validated.success) {
    return { error: "Confira os campos destacados." };
  }

  const { valorCentavos, formaPagamento } = validated.data;
  const hoje = hojeISO();

  const [pagamento] = await db
    .insert(pedidoPagamentos)
    .values({ pedidoId, valorCentavos, formaPagamento, confirmado: true })
    .returning({ id: pedidoPagamentos.id });

  await db.insert(transacoesFinanceiras).values({
    tipo: "entrada",
    categoria: "pagamento_pedido",
    valorCentavos,
    data: hoje,
    descricao: `Pagamento - ${pedido.cliente.nome}`,
    pedidoPagamentoId: pagamento.id,
  });

  revalidatePath(`/pedidos/${pedidoId}`);
  return undefined;
}

const TRANSICOES_PERMITIDAS: Record<string, string[]> = {
  orcamento: ["confirmado", "cancelado"],
  confirmado: ["producao", "entregue", "cancelado"],
  producao: ["entregue", "cancelado"],
  entregue: [],
  cancelado: [],
};

export async function transitionPedidoStatus(
  pedidoId: string,
  novoStatus: "confirmado" | "producao" | "entregue" | "cancelado",
): Promise<{ error?: string }> {
  await requireUser();

  const pedido = await getPedido(pedidoId);
  if (!pedido) {
    return { error: "Pedido não encontrado." };
  }

  if (!TRANSICOES_PERMITIDAS[pedido.status]?.includes(novoStatus)) {
    return { error: `Não dá pra mudar de "${pedido.status}" pra "${novoStatus}".` };
  }

  const resumo = await getResumoFinanceiro(pedidoId);

  if (novoStatus === "confirmado" && resumo.totalPedidoCentavos <= 0) {
    return { error: "Adicione pelo menos um produto antes de confirmar o pedido." };
  }

  if (novoStatus === "entregue" && resumo.saldoDevedorCentavos > 0) {
    return {
      error: `Ainda falta receber ${(resumo.saldoDevedorCentavos / 100).toFixed(2)} pra marcar como entregue.`,
    };
  }

  await db.update(pedidos).set({ status: novoStatus }).where(eq(pedidos.id, pedidoId));

  revalidatePath(`/pedidos/${pedidoId}`);
  revalidatePath("/pedidos");
  return {};
}
