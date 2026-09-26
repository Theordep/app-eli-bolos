import Link from "next/link";
import { Plus } from "lucide-react";
import { listProdutos, getReceitaItensComInsumo } from "@/lib/db/queries/produtos";
import { getConfiguracaoAtual } from "@/lib/db/queries/configuracoes";
import { calcularCustoDireto } from "@/lib/produto-custo";
import { formatCentavosToBRL } from "@/lib/currency";
import { DeleteProdutoButton } from "@/components/produtos/delete-produto-button";

const MODO_VENDA_LABEL: Record<string, string> = { kg: "por kg", unidade: "por unidade" };

export default async function ProdutosPage() {
  const [lista, config] = await Promise.all([listProdutos(), getConfiguracaoAtual()]);

  const custosPorProduto = new Map<string, number>();
  if (config) {
    const itensPorProduto = await Promise.all(
      lista.map((produto) => getReceitaItensComInsumo(produto.id)),
    );

    lista.forEach((produto, i) => {
      const itens = itensPorProduto[i];
      if (itens.length > 0) {
        const custo = calcularCustoDireto(itens, config);
        custosPorProduto.set(produto.id, custo.custoDiretoTotalCentavos);
      }
    });
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold text-foreground">Produtos</h1>
        <Link
          href="/produtos/novo"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden />
          Novo
        </Link>
      </div>

      {!config && (
        <p className="mb-4 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
          Configure a{" "}
          <Link href="/configuracoes" className="font-medium text-primary underline">
            precificação
          </Link>{" "}
          antes, pra ver o custo calculado de cada produto.
        </p>
      )}

      {lista.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhum produto cadastrado ainda. Comece adicionando um sabor/receita.
        </p>
      ) : (
        <ul className="space-y-2">
          {lista.map((produto) => {
            const custo = custosPorProduto.get(produto.id);

            return (
              <li
                key={produto.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
              >
                <Link href={`/produtos/${produto.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{produto.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {MODO_VENDA_LABEL[produto.modoVenda]}
                    {custo !== undefined
                      ? ` · custo direto ${formatCentavosToBRL(Math.round(custo))}`
                      : " · sem ficha técnica ainda"}
                  </p>
                </Link>
                <DeleteProdutoButton produtoId={produto.id} produtoNome={produto.nome} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
