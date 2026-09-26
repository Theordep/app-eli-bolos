import { ClienteForm } from "@/components/clientes/cliente-form";
import { createCliente } from "@/lib/actions/clientes";

export default function NovoClientePage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 font-heading text-xl font-semibold text-foreground">
        Novo cliente
      </h1>
      <ClienteForm action={createCliente} submitLabel="Adicionar" />
    </div>
  );
}
