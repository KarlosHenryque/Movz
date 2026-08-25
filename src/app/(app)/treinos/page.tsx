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
					"id,treino_id,exercicio_id,ordem,series_planejadas,repeticoes_planejadas,carga_sugerida,descanso_segundos",
				)
				.eq("usuario_id", user.id)
				.order("ordem"),
		]);

	const nomes = new Map((exercicios ?? []).map((exercicio) => [exercicio.id, exercicio]));
	const completos = (treinos ?? []).map((treino) => ({
		...treino,
		exercicios_treino: (planos ?? [])
			.filter((plano) => plano.treino_id === treino.id)
			.map((plano) => ({ ...plano, exercicios: nomes.get(plano.exercicio_id) ?? null })),
	}));

	return (
		<>
			<Cabecalho titulo="Treinos" subtitulo="Fichas simples, evolução visível" />
			<GerenciadorTreinos itens={completos} exercicios={exercicios ?? []} />
		</>
	);
}
