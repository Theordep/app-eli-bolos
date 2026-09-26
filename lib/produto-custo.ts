import type { ReceitaItemComInsumo } from "@/lib/db/queries/produtos";
import type { ConfiguracaoAtual } from "@/lib/db/queries/configuracoes";

export type CustoDireto = {
  custoIngredientesCentavos: number;
  custoPerdaCentavos: number;
  custoInvisivelCentavos: number;
  custoDiretoTotalCentavos: number;
};

/**
 * Custo direto (ingredientes + perda + invisível) por "1 unidade de venda" do produto
 * (1kg ou 1 unidade, conforme produtos.modoVenda) — ver docs/01-modelo-dados.md §3.
 * Mão de obra e margem ficam de fora de propósito: só existem quando existe um pedido real.
 */
export function calcularCustoDireto(
  itens: ReceitaItemComInsumo[],
  config: ConfiguracaoAtual,
): CustoDireto {
  const custoIngredientesCentavos = itens.reduce((total, item) => {
    const quantidade = Number(item.quantidadeUtilizada);
    const custoUnitario =
      item.insumo.embalagemPrecoCentavos / Number(item.insumo.embalagemQuantidadeBase);
    return total + quantidade * custoUnitario;
  }, 0);

  const custoPerdaCentavos =
    custoIngredientesCentavos * (Number(config.taxaPerdaPercentual) / 100);
  const custoInvisivelCentavos =
    custoIngredientesCentavos * (Number(config.custoInvisivelPercentual) / 100);

  return {
    custoIngredientesCentavos,
    custoPerdaCentavos,
    custoInvisivelCentavos,
    custoDiretoTotalCentavos:
      custoIngredientesCentavos + custoPerdaCentavos + custoInvisivelCentavos,
  };
}
