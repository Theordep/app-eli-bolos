import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { insumos } from "@/lib/db/schema";
import {
  getProduto,
  getReceitaItensComInsumo,
} from "@/lib/db/queries/produtos";
import { getConfiguracaoAtual } from "@/lib/db/queries/configuracoes";
import { calcularCustoDireto } from "@/lib/produto-custo";
import { ProdutoForm } from "@/components/produtos/produto-form";
import { ReceitaItensManager } from "@/components/produtos/receita-itens-manager";
import { CustoDiretoCard } from "@/components/produtos/custo-direto-card";
import { updateProduto } from "@/lib/actions/produtos";

export default async function EditarProdutoPage({
  params,
}: PageProps<"/produtos/[id]">) {
  const { id } = await params;

  const produto = await getProduto(id);
  if (!produto) {
    notFound();
  }

  const [itens, config, insumosDisponiveis] = await Promise.all([
    getReceitaItensComInsumo(id),
    getConfiguracaoAtual(),
    db
      .select({ id: insumos.id, nome: insumos.nome, unidadeBase: insumos.unidadeBase })
      .from(insumos),
  ]);

  const unidadeVenda = produto.modoVenda === "kg" ? "kg" : "unidade";
  const custo = config && itens.length > 0 ? calcularCustoDireto(itens, config) : null;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="mb-4 font-heading text-xl font-semibold text-foreground">
          {produto.nome}
        </h1>
        <ProdutoForm
          action={updateProduto.bind(null, produto.id)}
          submitLabel="Salvar alterações"
          defaultValues={{
            nome: produto.nome,
            modoVenda: produto.modoVenda,
            tamanhoLotePadrao: produto.tamanhoLotePadrao ? String(produto.tamanhoLotePadrao) : "",
            tempoPreparoEstimadoMinutos: String(produto.tempoPreparoEstimadoMinutos),
          }}
        />
      </div>

      {custo && <CustoDiretoCard custo={custo} unidadeVenda={unidadeVenda} />}

      {!config && (
        <p className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
          Configure a precificação em Configurações pra ver o custo calculado aqui.
        </p>
      )}

      <div>
        <h2 className="mb-2 font-heading text-lg font-semibold text-foreground">
          Ficha técnica
        </h2>
        <ReceitaItensManager
          produtoId={produto.id}
          modoVenda={produto.modoVenda}
          itens={itens}
          insumosDisponiveis={insumosDisponiveis}
        />
      </div>
    </div>
  );
}
