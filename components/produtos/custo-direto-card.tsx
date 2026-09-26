import { formatCentavosToBRL, formatCentavosToBRLPreciso } from "@/lib/currency";
import type { CustoDireto } from "@/lib/produto-custo";

export function CustoDiretoCard({
  custo,
  unidadeVenda,
}: {
  custo: CustoDireto;
  unidadeVenda: string;
}) {
  return (
    <div className="space-y-2 rounded-xl bg-secondary p-3.5">
      <p className="text-sm font-medium text-secondary-foreground">
        Custo direto por {unidadeVenda}
      </p>

      <dl className="space-y-1 text-sm">
        <Row label="Ingredientes" value={custo.custoIngredientesCentavos} />
        <Row label="Perda" value={custo.custoPerdaCentavos} />
        <Row label="Gás/luz/água" value={custo.custoInvisivelCentavos} />
      </dl>

      <div className="flex items-baseline justify-between border-t border-secondary-foreground/15 pt-2">
        <span className="text-sm font-medium text-secondary-foreground">Total</span>
        <span className="font-heading text-lg font-semibold text-secondary-foreground">
          {formatCentavosToBRL(Math.round(custo.custoDiretoTotalCentavos))}
        </span>
      </div>

      <p className="text-xs text-secondary-foreground/70">
        Não inclui mão de obra nem margem de lucro — isso é calculado na hora de montar o
        orçamento de cada pedido, porque depende do tempo daquele pedido específico.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-secondary-foreground/80">
      <dt>{label}</dt>
      <dd>{formatCentavosToBRLPreciso(value)}</dd>
    </div>
  );
}
