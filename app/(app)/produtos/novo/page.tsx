import { ProdutoForm } from "@/components/produtos/produto-form";
import { createProduto } from "@/lib/actions/produtos";

export default function NovoProdutoPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 font-heading text-xl font-semibold text-foreground">
        Novo produto
      </h1>
      <ProdutoForm action={createProduto} submitLabel="Criar e adicionar ingredientes" />
    </div>
  );
}
