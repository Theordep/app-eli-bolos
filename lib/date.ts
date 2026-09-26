/**
 * Data local (não UTC) no formato YYYY-MM-DD. `toISOString()` sozinho usa UTC — num servidor
 * hospedado em UTC (Vercel), isso vira o dia errado à noite no horário do Brasil e desalinha
 * pedidos/pagamentos com o dashboard mensal. Sempre usar esta função pra "hoje".
 */
export function hojeISO(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function deslocarDiasISO(offsetDias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  return d.toLocaleDateString("en-CA");
}
