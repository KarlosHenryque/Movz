import { Cabecalho } from "@/components/cabecalho";
import { GerenciadorTreinos } from "@/features/treinos/gerenciador-treinos";
import { exigirUsuario } from "@/lib/autenticacao/usuario";
export default async function Page() {
  const { supabase, user } = await exigirUsuario();
  const [{ data: treinos }, { data: exercicios }, { data: planos }] =
    await Promise.all([
      supabase
        .from("treinos")
        .select("id,nome,descricao,ativo")
        .eq("usuario_id", user.id)
        .order("criado_em", { ascending: false }),
      supabase
        .from("exercicios")
        .select("id,nome,grupo_muscular")
        .eq("usuario_id", user.id)
        .eq("ativo", true)
        .order("nome"),
      supabase
        .from("exercicios_treino")
        .select(
          "treino_id,exercicio_id,series_planejadas,repeticoes_planejadas,carga_sugerida,descanso_segundos",
        )
        .eq("usuario_id", user.id),
    ]);

  // Criar mapa de exercícios por ID para fácil lookup
  const exerciciosMap = new Map(
    (exercicios ?? []).map((e) => [
      e.id,
      { nome: e.nome, grupo_muscular: e.grupo_muscular },
    ]),
  );

  // Enriquecer planos com dados de exercícios
  const planosEnriquecidos = (planos ?? []).map((p) => ({
    ...p,
    exercicios: exerciciosMap.get(p.exercicio_id) || null,
  }));

  const completos = (treinos ?? []).map((t) => ({
    ...t,
    exercicios_treino: planosEnriquecidos.filter(
      (p) => p.treino_id === t.id,
    ),
  }));
  return (
    <>
      <Cabecalho
        titulo="Treinos"
        subtitulo="Fichas simples, evolução visível"
      />
      <GerenciadorTreinos itens={completos} exercicios={exercicios ?? []} />
    </>
  );
}
