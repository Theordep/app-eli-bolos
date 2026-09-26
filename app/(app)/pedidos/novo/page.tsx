import Link from "next/link";
import { db } from "@/lib/db";
import { PedidoForm } from "@/components/pedidos/pedido-form";

export default async function NovoPedidoPage() {
  const clientes = await db.query.clientes.findMany({
    orderBy: (clientes, { asc }) => [asc(clientes.nome)],
  });

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 font-heading text-xl font-semibold text-foreground">
        Novo orçamento
      </h1>

      {clientes.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Cadastre um{" "}
          <Link href="/clientes/novo" className="font-medium text-primary underline">
            cliente
          </Link>{" "}
          antes de criar um pedido.
        </p>
      ) : (
        <div className="mt-4">
          <PedidoForm clientes={clientes} />
        </div>
      )}
    </div>
  );
}
