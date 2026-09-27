import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, ShoppingCart, TrendingUp } from "lucide-react";
import { getResumoMensal } from "@/lib/db/queries/financeiro";
import { formatCentavosToBRL } from "@/lib/currency";

const MESES_ABREV = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

const CATEGORIA_LABEL: Record<string, string> = {
  pagamento_pedido: "Pagamento",
  compra_insumo: "Compra de insumo",
  compra_diversa: "Gasto diverso",
  outro: "Outro",
};

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

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const mesParam = typeof params.mes === "string" ? params.mes : undefined;
  const anoMes = mesParam ?? anoMesAtual();

  const resumo = await getResumoMensal(anoMes);
  const mesAnterior = deslocarMes(anoMes, -1);
  const mesSeguinte = deslocarMes(anoMes, 1);
  const lancamentos = resumo.transacoes.slice(0, 10);

  return (
    <div className="mx-auto flex max-w-[920px] flex-col gap-5 md:gap-7">
      {/* Cabeçalho do mês — mobile: um cartão só; desktop: elementos soltos + ações à direita */}
      <div className="flex items-center justify-between gap-2 rounded-[16.8px] border border-border bg-card p-0.5 md:hidden">
        <Link
          href={`/?mes=${mesAnterior}`}
          className="flex size-12 items-center justify-center text-foreground"
        >
          <ChevronLeft className="size-[18px]" aria-hidden />
        </Link>
        <span className="font-heading text-lg font-bold text-foreground">{labelDoMes(anoMes)}</span>
        <Link
          href={`/?mes=${mesSeguinte}`}
          className="flex size-12 items-center justify-center text-foreground"
        >
          <ChevronRight className="size-[18px]" aria-hidden />
        </Link>
      </div>

      <div className="hidden items-center justify-between gap-4 md:flex">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/?mes=${mesAnterior}`}
            className="flex size-10 items-center justify-center rounded-xl border border-input bg-card text-foreground"
          >
            <ChevronLeft className="size-[18px]" aria-hidden />
          </Link>
          <h1 className="min-w-[200px] text-center font-heading text-xl font-bold text-foreground">
            {labelDoMes(anoMes)}
          </h1>
          <Link
            href={`/?mes=${mesSeguinte}`}
            className="flex size-10 items-center justify-center rounded-xl border border-input bg-card text-foreground"
          >
            <ChevronRight className="size-[18px]" aria-hidden />
          </Link>
        </div>

        <div className="flex gap-2.5">
          <Link
            href="/compras/novo"
            className="flex h-12 items-center gap-2 rounded-[16.8px] border border-input bg-card px-4.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            <ShoppingCart className="size-[18px]" aria-hidden />
            Gastei no mercado
          </Link>
          <Link
            href="/pedidos/novo"
            className="flex h-12 items-center gap-2 rounded-[16.8px] bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-[18px]" aria-hidden />
            Novo pedido
          </Link>
        </div>
      </div>

      {/* Ações rápidas — só no mobile, empilhadas, "Novo pedido" primeiro */}
      <div className="flex flex-col gap-2.5 md:hidden">
        <Link
          href="/pedidos/novo"
          className="flex h-13 items-center justify-center gap-2 rounded-[16.8px] bg-primary text-base font-medium text-primary-foreground"
        >
          <Plus className="size-[18px]" aria-hidden />
          Novo pedido
        </Link>
        <Link
          href="/compras/novo"
          className="flex h-13 items-center justify-center gap-2 rounded-[16.8px] border border-input bg-card text-base font-medium text-foreground"
        >
          <ShoppingCart className="size-[18px]" aria-hidden />
          Gastei no mercado
        </Link>
      </div>

      {/* Cards de resumo — lucro primeiro e maior, sempre */}
      <div className="flex flex-col gap-3.5 md:grid md:grid-cols-[1.3fr_1fr_1fr] md:gap-3.5">
        <div className="flex flex-col justify-between gap-2 rounded-[16.8px] bg-secondary p-4.5 md:gap-4.5 md:p-[22px]">
          <span className="text-sm font-medium text-secondary-foreground">Meu lucro no mês</span>
          <span className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-[40px]">
            {formatCentavosToBRL(resumo.saldoCentavos)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 md:contents">
          <div className="flex flex-col justify-between gap-2 rounded-[16.8px] border border-input bg-card p-3.5 md:gap-4.5 md:p-[22px]">
            <span className="flex items-center gap-2 text-xs text-muted-foreground md:text-sm">
              <TrendingUp className="hidden size-[14px] md:inline" aria-hidden />
              Fiz de venda
            </span>
            <span className="font-heading text-xl font-semibold text-foreground md:text-2xl">
              {formatCentavosToBRL(resumo.entradasCentavos)}
            </span>
          </div>
          <div className="flex flex-col justify-between gap-2 rounded-[16.8px] border border-input bg-card p-3.5 md:gap-4.5 md:p-[22px]">
            <span className="flex items-center gap-2 text-xs text-muted-foreground md:text-sm">
              <ShoppingCart className="hidden size-[14px] md:inline" aria-hidden />
              Gastei no mercado
            </span>
            <span className="font-heading text-xl font-semibold text-foreground md:text-2xl">
              {formatCentavosToBRL(resumo.saidasCentavos)}
            </span>
          </div>
        </div>
      </div>

      {/* Últimos lançamentos */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-foreground">Últimos lançamentos</h2>

        {lancamentos.length === 0 ? (
          <div className="rounded-[16.8px] border border-input bg-card p-3.5">
            <p className="rounded-xl bg-muted px-3.5 py-7 text-center text-sm text-muted-foreground">
              Nenhum lançamento neste mês
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-[16.8px] border border-input bg-card">
            {lancamentos.map((t) => {
              const mesAbrev = MESES_ABREV[Number(t.data.split("-")[1]) - 1];

              return (
                <li key={t.id} className="flex items-center gap-3 px-3.5 py-3 md:gap-3.5 md:p-3.5">
                  <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-background leading-tight md:size-12">
                    <span className="font-heading text-[15px] font-bold text-foreground md:text-base">
                      {t.data.split("-")[2]}
                    </span>
                    <span className="text-[11px] text-muted-foreground md:text-xs">{mesAbrev}</span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm text-foreground md:text-base">
                      {t.descricao ?? "—"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {CATEGORIA_LABEL[t.categoria] ?? "Outro"}
                      <span className="hidden md:inline"> · {formatDataCurta(t.data)}</span>
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-foreground md:text-base">
                    {t.tipo === "saida" ? "-" : ""}
                    {formatCentavosToBRL(t.valorCentavos)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
