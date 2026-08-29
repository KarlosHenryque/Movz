import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/cabecalho";
import { Cronometro } from "@/components/cronometro";
import { concluirTreino, registrarSerie } from "@/features/treinos/acoes";
import { exigirUsuario } from "@/lib/autenticacao/usuario";

type Plano = {
  id: number;
  exercicio_id: number;
  ordem: number;
  series_planejadas: number;
  repeticoes_planejadas: string;
  carga_sugerida: number | null;
  descanso_segundos: number;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) notFound();

  const { supabase, user } = await exigirUsuario();
  const { data: execucao } = await supabase
    .from("execucoes_treino")
    .select("id,nome_treino,status,treino_id")
    .eq("id", id)
    .eq("usuario_id", user.id)
    .single();

  if (!execucao || execucao.status !== "EM_ANDAMENTO" || !execucao.treino_id) {
    notFound();
  }

  const [{ data: planos }, { data: series }] = await Promise.all([
    supabase
      .from("exercicios_treino")
      .select("id,exercicio_id,ordem,series_planejadas,repeticoes_planejadas,carga_sugerida,descanso_segundos")
      .eq("treino_id", execucao.treino_id)
      .eq("usuario_id", user.id)
      .order("ordem"),
    supabase
      .from("series_executadas")
      .select("id,nome_exercicio,ordem_exercicio,repeticoes,carga,volume")
      .eq("execucao_id", id)
      .eq("usuario_id", user.id)
      .order("concluida_em"),
  ]);

  const planosOrdenados = (planos ?? []) as Plano[];
  if (!planosOrdenados.length) notFound();

  const planoAtual = planosOrdenados.find((plano) => {
    const concluidas = series?.filter((s) => s.ordem_exercicio === plano.ordem).length ?? 0;
    return concluidas < plano.series_planejadas;
  });
  const totalSeries = planosOrdenados.reduce((total, plano) => total + plano.series_planejadas, 0);
  const concluidas = series?.length ?? 0;
  const exercicioAtual = planoAtual
    ? await supabase.from("exercicios").select("nome").eq("id", planoAtual.exercicio_id).eq("usuario_id", user.id).single()
    : { data: null };

  if (planoAtual && !exercicioAtual.data) notFound();

  return (
    <>
      <Cabecalho titulo={execucao.nome_treino} subtitulo={`${concluidas} de ${totalSeries} séries concluídas`} />
      {!planoAtual ? (
        <section className="execucao execucao-finalizada">
          <p className="eyebrow">TREINO CONCLUÍDO</p>
          <h2>Excelente trabalho!</h2>
          <p className="muted">Todos os exercícios da ficha foram concluídos.</p>
          <form action={concluirTreino}>
            <input type="hidden" name="execucao_id" value={id} />
            <button className="botao primario">Finalizar treino</button>
          </form>
        </section>
      ) : (
        <>
          <section className="execucao">
            <div className="execucao-progresso">
              <span>Exercício {planosOrdenados.findIndex((p) => p.id === planoAtual.id) + 1} de {planosOrdenados.length}</span>
              <strong>{Math.round((concluidas / totalSeries) * 100)}%</strong>
            </div>
            <p className="eyebrow">AGORA</p>
            <h2>{exercicioAtual.data?.nome}</h2>
            <p className="muted">Série {(series?.filter((s) => s.ordem_exercicio === planoAtual.ordem).length ?? 0) + 1} de {planoAtual.series_planejadas} · Planejado: {planoAtual.repeticoes_planejadas} repetições</p>
            <form action={registrarSerie}>
              <input type="hidden" name="execucao_id" value={id} />
              <input type="hidden" name="exercicio_id" value={planoAtual.exercicio_id} />
              <input type="hidden" name="nome_exercicio" value={exercicioAtual.data?.nome} />
              <input type="hidden" name="ordem_exercicio" value={planoAtual.ordem} />
              <div className="campos-serie">
                <label>Carga (kg)<input name="carga" type="number" min="0" step="0.5" defaultValue={planoAtual.carga_sugerida ?? 0} required /></label>
                <label>Repetições<input name="repeticoes" type="number" min="0" defaultValue={Number.parseInt(planoAtual.repeticoes_planejadas) || 10} required /></label>
              </div>
              <button className="botao primario">Concluir série</button>
            </form>
          </section>
          <Cronometro segundosIniciais={planoAtual.descanso_segundos} />
        </>
      )}
      {series?.map((serie) => (
        <div className="cartao linha espacada" key={serie.id}>
          <span>{serie.nome_exercicio} · série {serie.ordem_exercicio}</span>
          <strong>{serie.carga} kg × {serie.repeticoes}</strong>
        </div>
      ))}
    </>
  );
}
