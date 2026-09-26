import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { DeleteClienteButton } from "@/components/clientes/delete-cliente-button";

export default async function ClientesPage() {
  const lista = await db.query.clientes.findMany({
    orderBy: (clientes, { asc }) => [asc(clientes.nome)],
  });

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold text-foreground">Clientes</h1>
        <Link
          href="/clientes/novo"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden />
          Novo
        </Link>
      </div>

      {lista.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhum cliente cadastrado ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {lista.map((cliente) => (
            <li
              key={cliente.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
            >
              <Link href={`/clientes/${cliente.id}`} className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{cliente.nome}</p>
                <p className="text-xs text-muted-foreground">{cliente.telefoneWhatsapp}</p>
              </Link>
              <DeleteClienteButton clienteId={cliente.id} clienteNome={cliente.nome} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
