import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clientes } from "@/lib/db/schema";
import { ClienteForm } from "@/components/clientes/cliente-form";
import { updateCliente } from "@/lib/actions/clientes";

export default async function EditarClientePage({
  params,
}: PageProps<"/clientes/[id]">) {
  const { id } = await params;

  const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
  if (!cliente) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 font-heading text-xl font-semibold text-foreground">
        Editar cliente
      </h1>
      <ClienteForm
        action={updateCliente.bind(null, cliente.id)}
        submitLabel="Salvar alterações"
        defaultValues={cliente}
      />
    </div>
  );
}
