"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirUsuario } from "@/lib/autenticacao/usuario";
export async function salvarTreino(form: FormData) {
  const { supabase, user } = await exigirUsuario();
  const id = String(form.get("id") ?? "");
  const nome = String(form.get("nome") ?? "").trim();
  if (!nome) throw new Error("Informe o nome do treino.");
  const registro = {
    nome,
    descricao: String(form.get("descricao") ?? ""),
    ativo: form.get("ativo") === "true",
    usuario_id: user.id,
    atualizado_em: new Date().toISOString(),
  };
  let treinoId = id;
  if (id) {
    const { error } = await supabase
      .from("treinos")
      .update(registro)
      .eq("id", id)
      .eq("usuario_id", user.id);
    if (error) throw new Error("Não foi possível editar o treino.");
  } else {
    const { data, error } = await supabase
      .from("treinos")
      .insert(registro)
      .select("id")
      .single();
    if (error) throw new Error("Não foi possível criar o treino.");
    treinoId = data.id;
  }
  const exercicio = String(form.get("exercicio_id") ?? "");
  if (exercicio) {
    await supabase
      .from("exercicios_treino")
      .delete()
      .eq("treino_id", treinoId)
      .eq("usuario_id", user.id);
    const { error } = await supabase
      .from("exercicios_treino")
      .insert({
        usuario_id: user.id,
        treino_id: treinoId,
        exercicio_id: exercicio,
        ordem: 1,
        series_planejadas: Number(form.get("series") ?? 3),
        repeticoes_planejadas: String(form.get("repeticoes") ?? "10"),
        carga_sugerida: Number(form.get("carga") ?? 0),
        descanso_segundos: Number(form.get("descanso") ?? 60),
      });
    if (error)
      throw new Error(
        "Treino salvo, mas não foi possível associar o exercício.",
      );
  }
  revalidatePath("/treinos");
  revalidatePath("/");
}
export async function excluirTreino(form: FormData) {
  const { supabase, user } = await exigirUsuario();
  const { error } = await supabase
    .from("treinos")
    .delete()
    .eq("id", String(form.get("id") ?? ""))
    .eq("usuario_id", user.id);
  if (error) throw new Error("Não foi possível excluir o treino.");
  revalidatePath("/treinos");
  revalidatePath("/");
}
export async function iniciarTreino(form: FormData) {
  const { supabase, user } = await exigirUsuario();
  const treinoId = String(form.get("id") ?? "");
  const nome = String(form.get("nome") ?? "");
  const { data, error } = await supabase
    .from("execucoes_treino")
    .insert({ usuario_id: user.id, treino_id: treinoId, nome_treino: nome })
    .select("id")
    .single();
  if (error) throw new Error("Não foi possível iniciar o treino.");
  redirect(`/treinos/executar?id=${data.id}`);
}
export async function registrarSerie(form: FormData) {
  const { supabase, user } = await exigirUsuario();
  const execucaoId = String(form.get("execucao_id"));
  const exercicioId = String(form.get("exercicio_id"));
  const nome = String(form.get("nome_exercicio"));
  const { count } = await supabase
    .from("series_executadas")
    .select("id", { count: "exact", head: true })
    .eq("execucao_id", execucaoId)
    .eq("usuario_id", user.id);
  const { error } = await supabase
    .from("series_executadas")
    .insert({
      usuario_id: user.id,
      execucao_id: execucaoId,
      exercicio_id: exercicioId,
      nome_exercicio: nome,
      ordem_exercicio: 1,
      numero_serie: (count ?? 0) + 1,
      repeticoes: Number(form.get("repeticoes")),
      carga: Number(form.get("carga")),
    });
  if (error) throw new Error("Não foi possível registrar a série.");
  revalidatePath(`/treinos/executar?id=${execucaoId}`);
}
export async function concluirTreino(form: FormData) {
  const { supabase, user } = await exigirUsuario();
  const { error } = await supabase
    .from("execucoes_treino")
    .update({ status: "CONCLUIDA", concluida_em: new Date().toISOString() })
    .eq("id", String(form.get("execucao_id")))
    .eq("usuario_id", user.id);
  if (error) throw new Error("Não foi possível concluir o treino.");
  revalidatePath("/");
  revalidatePath("/historico");
  redirect("/historico");
}
