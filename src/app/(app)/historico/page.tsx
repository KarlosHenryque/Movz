import { Cabecalho } from "@/components/cabecalho";
import { Cartao } from "@/components/cartao";
import { exigirUsuario } from "@/lib/autenticacao/usuario";
export default async function Page() {
  const { supabase, user } = await exigirUsuario();
  const inicio = new Date();
  inicio.setDate(1);
  const [{ data: execucoes }, { data: series }] = await Promise.all([
    supabase
      .from("execucoes_treino")
      .select("id,nome_treino,status,iniciada_em,concluida_em")
      .eq("usuario_id", user.id)
      .order("iniciada_em", { ascending: false })
      .limit(30),
    supabase
      .from("series_executadas")
      .select("nome_exercicio,carga,volume")
      .eq("usuario_id", user.id)
      .gte("concluida_em", inicio.toISOString()),
  ]);
  const volume = series?.reduce((s, i) => s + Number(i.volume), 0) ?? 0;
  const recordes = new Map<string, number>();
  series?.forEach((s) =>
    recordes.set(
      s.nome_exercicio,
      Math.max(recordes.get(s.nome_exercicio) ?? 0, Number(s.carga)),
    ),
  );
  return (
    <>
      <Cabecalho titulo="Evolução" subtitulo="Seu progresso, série por série" />
      <div className="grade">
        <Cartao titulo="Volume no mês">
          <strong className="valor">{volume.toLocaleString("pt-BR")} kg</strong>
          <p className="muted">Somatório de todas as séries registradas.</p>
        </Cartao>
        <Cartao titulo="Recordes">
          {[...recordes].map(([nome, carga]) => (
            <div className="linha espacada" key={nome}>
              <span>{nome}</span>
              <strong>{carga} kg</strong>
            </div>
          ))}
          {!recordes.size && (
            <p className="muted">As melhores cargas aparecerão aqui.</p>
          )}
        </Cartao>
      </div>
      <h2 className="titulo-secao">Treinos realizados</h2>
      <div className="lista-cards">
        {execucoes?.map((e) => (
          <article className="cartao linha-lista" key={e.id}>
            <div>
              <h2>{e.nome_treino}</h2>
              <p className="muted">
                {new Date(e.iniciada_em).toLocaleString("pt-BR")}
              </p>
            </div>
            <span
              className={e.status === "CONCLUIDA" ? "status ativo" : "status"}
            >
              {e.status === "CONCLUIDA"
                ? "Concluído"
                : e.status === "CANCELADA"
                  ? "Cancelado"
                  : "Em andamento"}
            </span>
          </article>
        ))}
        {!execucoes?.length && (
          <div className="cartao vazio">
            <span>↗</span>
            <p>Conclua um treino para iniciar seu histórico.</p>
          </div>
        )}
      </div>
    </>
  );
}
