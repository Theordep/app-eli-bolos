const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCentavosToBRL(centavos: number): string {
  return BRL_FORMATTER.format(centavos / 100);
}

const BRL_FORMATTER_PRECISE = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

/** Para custos unitários pequenos (ex.: preço por grama), onde 2 casas decimais some com o valor. */
export function formatCentavosToBRLPreciso(centavos: number): string {
  return BRL_FORMATTER_PRECISE.format(centavos / 100);
}

/** Valor pronto para preencher um <input> editável (sem "R$"), ex.: 1290 -> "12,90". */
export function centavosToInputValue(centavos: number): string {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

/** Aceita "12,90", "12.90" ou "R$ 12,90" e devolve centavos (inteiro), ou null se inválido. */
export function parseBRLToCentavos(input: string): number | null {
  const cleaned = input
    .replace(/[^\d,.-]/g, "")
    .trim();
  if (!cleaned) return null;

  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;

  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value < 0) return null;

  return Math.round(value * 100);
}

/** Aceita "395" ou "1,5" e devolve um número (para quantidades, não dinheiro). */
export function parseDecimal(input: string): number | null {
  const cleaned = input.trim().replace(",", ".");
  if (!cleaned) return null;

  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;

  return value;
}
