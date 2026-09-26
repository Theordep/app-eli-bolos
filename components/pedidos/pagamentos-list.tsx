import { formatCentavosToBRL } from "@/lib/currency";

const TIPO_LABEL: Record<string, string> = { sinal: "Sinal", saldo: "Saldo", outro: "Outro" };
const FORMA_LABEL: Record<string, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  outro: "Outro",
};

type Pagamento = {
  id: string;
  tipo: string;
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
            {TIPO_LABEL[p.tipo]} · {FORMA_LABEL[p.formaPagamento]}
          </span>
          <span className="font-medium text-foreground">
            {formatCentavosToBRL(p.valorCentavos)}
          </span>
        </li>
      ))}
    </ul>
  );
}
