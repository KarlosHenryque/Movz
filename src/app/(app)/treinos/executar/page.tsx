import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/cabecalho";
import { Cronometro } from "@/components/cronometro";
import { concluirTreino, registrarSerie } from "@/features/treinos/acoes";
import { exigirUsuario } from "@/lib/autenticacao/usuario";
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
  if (!execucao || execucao.status !== "EM_ANDAMENTO") notFound();
  const [{ data: planos }, { data: series }] = await Promise.all([
    supabase
      .from("exercicios_treino")
      .select(
        "exercicio_id,series_planejadas,repeticoes_planejadas,carga_sugerida,descanso_segundos",
      )
      .eq("treino_id", execucao.treino_id)
      .eq("usuario_id", user.id)
      .order("ordem"),
    supabase
      .from("series_executadas")
      .select("id,nome_exercicio,repeticoes,carga,volume")
      .eq("execucao_id", id)
      .eq("usuario_id", user.id)
      .order("concluida_em"),
  ]);
  const plano = planos?.[0];
  if (!plano) notFound();
  const { data: ex } = await supabase
    .from("exercicios")
    .select("nome")
    .eq("id", plano.exercicio_id)
    .eq("usuario_id", user.id)
    .single();
  if (!ex) notFound();
  return (
    <>
      <Cabecalho
        titulo={execucao.nome_treino}
        subtitulo={`${series?.length ?? 0} série(s) concluída(s)`}
      />
      <section className="execucao">
        <p className="eyebrow">EXERCÍCIO</p>
        <h2>{ex.nome}</h2>
        <p className="muted">
          Planejado: {plano.series_planejadas} × {plano.repeticoes_planejadas}
        </p>
        <form action={registrarSerie}>
          <input type="hidden" name="execucao_id" value={id} />
          <input type="hidden" name="exercicio_id" value={plano.exercicio_id} />
          <input type="hidden" name="nome_exercicio" value={ex.nome} />
          <div className="campos-serie">
            <label>
              Carga (kg)
              <input
                name="carga"
                type="number"
                min="0"
                step="0.5"
                defaultValue={plano.carga_sugerida ?? 0}
                required
              />
            </label>
            <label>
              Repetições
              <input
                name="repeticoes"
                type="number"
                min="0"
                defaultValue={
                  Number.parseInt(plano.repeticoes_planejadas) || 10
                }
                required
              />
            </label>
          </div>
          <button className="botao primario">Concluir série</button>
        </form>
      </section>
      <Cronometro segundosIniciais={plano.descanso_segundos} />
      {series?.map((s) => (
        <div className="cartao linha espacada" key={s.id}>
          <span>
            {s.nome_exercicio}: {s.repeticoes} × {s.carga} kg
          </span>
          <strong>{s.volume} kg</strong>
        </div>
      ))}
      <form action={concluirTreino}>
        <input type="hidden" name="execucao_id" value={id} />
        <button className="botao secundario">Concluir treino</button>
      </form>
    </>
  );
}
