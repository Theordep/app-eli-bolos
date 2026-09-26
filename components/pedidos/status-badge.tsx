const STATUS_LABEL: Record<string, string> = {
  orcamento: "Orçamento",
  confirmado: "Confirmado",
  producao: "Produção",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const STATUS_CLASS: Record<string, string> = {
  orcamento: "bg-muted text-muted-foreground",
  confirmado: "bg-secondary text-secondary-foreground",
  producao: "bg-primary/15 text-primary",
  entregue: "bg-primary text-primary-foreground",
  cancelado: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
