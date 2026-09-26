import Link from "next/link";
import { listListasCompra } from "@/lib/db/queries/listas-compra";
import { GerarListaForm } from "@/components/lista-compras/gerar-lista-form";
import { deslocarDiasISO } from "@/lib/date";

function formatData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default async function ListaComprasPage() {
  const listas = await listListasCompra();

  return (
    <div className="mx-auto max-w-md space-y-5">
      <h1 className="font-heading text-xl font-semibold text-foreground">Lista de Compras</h1>

      <GerarListaForm dataInicioPadrao={deslocarDiasISO(0)} dataFimPadrao={deslocarDiasISO(7)} />

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Listas geradas</h2>

        {listas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Nenhuma lista gerada ainda.
          </p>
        ) : (
          <ul className="space-y-2">
            {listas.map((lista) => (
              <li key={lista.id}>
                <Link
                  href={`/lista-compras/${lista.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <span className="text-sm text-foreground">
                    {formatData(lista.dataInicioPeriodo)} – {formatData(lista.dataFimPeriodo)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lista.status === "concluida" ? "Concluída" : "Em aberto"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
