import { db } from "@/lib/db";
import { PedidoForm } from "@/components/pedidos/pedido-form";

export default async function NovoPedidoPage() {
  const clientes = await db.query.clientes.findMany({
    orderBy: (clientes, { asc }) => [asc(clientes.nome)],
  });

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 font-heading text-xl font-semibold text-foreground">
        Novo orçamento
      </h1>

      <PedidoForm clientes={clientes} />
    </div>
  );
}
