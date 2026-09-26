import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";
import { getResumoMensal } from "@/lib/db/queries/financeiro";
import { formatCentavosToBRL } from "@/lib/currency";

function anoMesAtual() {
  return new Date().toLocaleDateString("en-CA").slice(0, 7); // YYYY-MM local
}

function deslocarMes(anoMes: string, delta: number) {
  const [ano, mes] = anoMes.split("-").map(Number);
  const d = new Date(ano, mes - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function labelDoMes(anoMes: string) {
  const [ano, mes] = anoMes.split("-").map(Number);
  const label = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatDataCurta(data: string) {
  const [, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
}

export default async function HomePage({
  searchParams,
}: PageProps<"/">) {
  const params = await searchParams;
  const mesParam = typeof params.mes === "string" ? params.mes : undefined;
  const anoMes = mesParam ?? anoMesAtual();

  const resumo = await getResumoMensal(anoMes);
  const mesAnterior = deslocarMes(anoMes, -1);
  const mesSeguinte = deslocarMes(anoMes, 1);

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href={`/?mes=${mesAnterior}`}
          className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
        >
          ‹
        </Link>
        <h1 className="font-heading text-lg font-semibold text-foreground">
          {labelDoMes(anoMes)}
        </h1>
        <Link
          href={`/?mes=${mesSeguinte}`}
          className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
        >
          ›
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-secondary p-3.5">
          <p className="text-xs text-secondary-foreground/70">Fiz de venda</p>
          <p className="font-heading text-lg font-semibold text-secondary-foreground">
            {formatCentavosToBRL(resumo.entradasCentavos)}
          </p>
        </div>
        <div className="rounded-xl bg-secondary p-3.5">
          <p className="text-xs text-secondary-foreground/70">Gastei no mercado</p>
          <p className="font-heading text-lg font-semibold text-secondary-foreground">
            {formatCentavosToBRL(resumo.saidasCentavos)}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-primary p-4 text-center">
        <p className="text-xs text-primary-foreground/80">Meu lucro no mês</p>
        <p className="font-heading text-2xl font-semibold text-primary-foreground">
          {formatCentavosToBRL(resumo.saldoCentavos)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/compras/novo"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          <ShoppingCart className="size-4" aria-hidden />
          Gastei no mercado
        </Link>
        <Link
          href="/pedidos/novo"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden />
          Novo pedido
        </Link>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Últimos lançamentos</h2>
        {resumo.transacoes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Nada lançado neste mês ainda.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {resumo.transacoes.slice(0, 10).map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate text-foreground">
                  {formatDataCurta(t.data)} · {t.descricao ?? "—"}
                </span>
                <span
                  className={
                    t.tipo === "entrada"
                      ? "shrink-0 font-medium text-foreground"
                      : "shrink-0 font-medium text-muted-foreground"
                  }
                >
                  {t.tipo === "saida" ? "-" : ""}
                  {formatCentavosToBRL(t.valorCentavos)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
