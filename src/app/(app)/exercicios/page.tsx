import { Cabecalho } from "@/components/cabecalho";
import { GerenciadorExercicios } from "@/features/exercicios/gerenciador-exercicios";
import { exigirUsuario } from "@/lib/autenticacao/usuario";

export default async function Page() {
  const { supabase, user } = await exigirUsuario();
  const { data, error } = await supabase
    .from("exercicios")
    .select("id,nome,grupo_muscular,descricao,observacoes,ativo")
    .eq("usuario_id", user.id)
    .order("nome");

  let itens = data ?? [];

  if (error) {
    const { data: exerciciosBasicos } = await supabase
      .from("exercicios")
      .select("id,nome,grupo_muscular")
      .eq("usuario_id", user.id)
      .order("nome");

    itens = (exerciciosBasicos ?? []).map((exercicio) => ({
      ...exercicio,
      descricao: null,
      observacoes: null,
      ativo: true,
    }));
  }

  return (
    <>
      <Cabecalho titulo="Exercícios" subtitulo="Sua biblioteca de movimentos" />
      <GerenciadorExercicios itens={itens} />
    </>
  );
}
;
