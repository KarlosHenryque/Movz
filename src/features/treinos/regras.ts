export type Serie = { carga: number; repeticoes: number };
export const calcularVolumeSerie = ({ carga, repeticoes }: Serie) =>
  carga * repeticoes;
export const calcularVolumeTotal = (series: Serie[]) =>
  series.reduce((total, serie) => total + calcularVolumeSerie(serie), 0);
export const cargaMaxima = (series: Serie[]) =>
  series.reduce((maior, serie) => Math.max(maior, serie.carga), 0);

export const limitesTreino = {
  nome: 80,
  descricao: 1000,
  repeticoes: 30,
  exercicios: 50,
} as const;
