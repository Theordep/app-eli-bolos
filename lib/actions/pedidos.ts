"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { db } from "@/lib/db";
import { pedidoItens, pedidos, produtoCustoSnapshot } from "@/lib/db/schema";
import { getProduto, getReceitaItensComInsumo } from "@/lib/db/queries/produtos";
import { getConfiguracaoAtual } from "@/lib/db/queries/configuracoes";
import { calcularCustoDireto } from "@/lib/produto-custo";
import { parseBRLToCentavos, parseDecimal } from "@/lib/currency";

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
  const validated = PedidoSchema.safeParse({
    clienteId: formData.get("clienteId"),
    dataEntregaPrevista: formData.get("dataEntregaPrevista"),
    observacoes: formData.get("observacoes") || undefined,
  });

  if (!validated.success) {
    return { error: "Confira os campos destacados." };
  }

  const hoje = new Date().toISOString().slice(0, 10);

  const [pedido] = await db
    .insert(pedidos)
    .values({ ...validated.data, dataPedido: hoje })
    .returning({ id: pedidos.id });

  redirect(`/pedidos/${pedido.id}`);
}

export async function deletePedido(pedidoId: string): Promise<{ error?: string }> {
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

export async function removePedidoItem(itemId: string, pedidoId: string) {
  await db.delete(pedidoItens).where(eq(pedidoItens.id, itemId));
  revalidatePath(`/pedidos/${pedidoId}`);
}
