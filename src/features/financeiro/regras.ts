export type DespesaResumo = { valor: number; tipo: "FIXA" | "VARIAVEL" };
export function resumirDespesas(despesas: DespesaResumo[]) {
  return despesas.reduce(
    (r, d) => ({
      total: r.total + d.valor,
      fixo: r.fixo + (d.tipo === "FIXA" ? d.valor : 0),
      variavel: r.variavel + (d.tipo === "VARIAVEL" ? d.valor : 0),
    }),
    { total: 0, fixo: 0, variavel: 0 },
  );
}
export function proximaCompetencia(data: Date) {
  const dia = data.getUTCDate();
  const proxima = new Date(
    Date.UTC(data.getUTCFullYear(), data.getUTCMonth() + 1, 1),
  );
  const ultimo = new Date(
    Date.UTC(proxima.getUTCFullYear(), proxima.getUTCMonth() + 1, 0),
  ).getUTCDate();
  proxima.setUTCDate(Math.min(dia, ultimo));
  return proxima;
}
