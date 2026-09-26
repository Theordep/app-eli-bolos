import { formatCentavosToBRL } from "@/lib/currency";

const FORMA_LABEL: Record<string, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  outro: "Outro",
};

type Pagamento = {
  id: string;
  valorCentavos: number;
  formaPagamento: string;
  dataPagamento: Date;
};

export function PagamentosList({ pagamentos }: { pagamentos: Pagamento[] }) {
  if (pagamentos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-3 text-center text-sm text-muted-foreground">
        Nenhum pagamento registrado ainda.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {pagamentos.map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-sm"
        >
          <span className="text-foreground">
            {FORMA_LABEL[p.formaPagamento]} ·{" "}
            {new Date(p.dataPagamento).toLocaleDateString("pt-BR")}
          </span>
          <span className="font-medium text-foreground">
            {formatCentavosToBRL(p.valorCentavos)}
          </span>
        </li>
      ))}
    </ul>
  );
}
