import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { TriangleAlert } from "lucide-react";
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

      {!cliente.telefoneWhatsapp && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
          Esse cliente ficou sem WhatsApp cadastrado — vale completar.
        </p>
      )}

      <ClienteForm
        action={updateCliente.bind(null, cliente.id)}
        submitLabel="Salvar alterações"
        defaultValues={cliente}
      />
    </div>
  );
}
