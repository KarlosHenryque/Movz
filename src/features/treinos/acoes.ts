"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirUsuario } from "@/lib/autenticacao/usuario";
import { limitesTreino } from "./regras";

export async function salvarTreino(form: FormData) {
  const { supabase, user } = await exigirUsuario();
  const id = String(form.get("id") ?? "");
  const nome = String(form.get("nome") ?? "").trim();
  const descricao = String(form.get("descricao") ?? "").trim();

  if (!nome) throw new Error("Informe o nome do treino.");
  if (nome.length > limitesTreino.nome)
    throw new Error("O nome do treino é muito longo.");
  if (descricao.length > limitesTreino.descricao)
    throw new Error("A descrição é muito longa.");

  const registro = {
    nome,
    descricao,
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

  // Suporte para múltiplos exercícios
  const exerciciosCount = Number(form.get("exercicios_count") ?? 0);
  if (
    !Number.isInteger(exerciciosCount) ||
    exerciciosCount < 0 ||
    exerciciosCount > limitesTreino.exercicios
  ) {
    throw new Error("Quantidade de exercícios inválida.");
  }

  // Limpar exercícios anteriores
  if (id || exerciciosCount > 0 || form.get("exercicio_id")) {
    const { error } = await supabase
      .from("exercicios_treino")
      .delete()
      .eq("treino_id", treinoId)
      .eq("usuario_id", user.id);
    if (error)
      throw new Error("Não foi possível atualizar os exercícios do treino.");
  }

  // Salvar múltiplos exercícios (novo formato)
  if (exerciciosCount > 0) {
    const exercicios: Array<{
      usuario_id: string;
      treino_id: string;
      exercicio_id: string;
      ordem: number;
      series_planejadas: number;
      repeticoes_planejadas: string;
      carga_sugerida: number;
      descanso_segundos: number;
    }> = [];

    for (let i = 0; i < exerciciosCount; i++) {
      const exercicioId = String(form.get(`exercicio_${i}_id`) ?? "");
      if (exercicioId) {
        const series = Number(form.get(`exercicio_${i}_series`) ?? 3);
        const repeticoes = String(
          form.get(`exercicio_${i}_repeticoes`) ?? "10",
        ).trim();
        const carga = Number(form.get(`exercicio_${i}_carga`) ?? 0);
        const descanso = Number(form.get(`exercicio_${i}_descanso`) ?? 60);
        if (
          !Number.isInteger(series) ||
          series < 1 ||
          series > 20 ||
          !repeticoes ||
          repeticoes.length > limitesTreino.repeticoes ||
          !Number.isFinite(carga) ||
          carga < 0 ||
          !Number.isInteger(descanso) ||
          descanso < 0 ||
          descanso > 3600
        ) {
          throw new Error("Revise os dados dos exercícios do treino.");
        }
        exercicios.push({
          usuario_id: user.id,
          treino_id: treinoId,
          exercicio_id: exercicioId,
          ordem: i + 1,
          series_planejadas: series,
          repeticoes_planejadas: repeticoes,
          carga_sugerida: carga,
          descanso_segundos: descanso,
        });
      }
    }

    if (exercicios.length > 0) {
      const { error } = await supabase
        .from("exercicios_treino")
        .insert(exercicios);
      if (error)
        throw new Error(
          "Treino salvo, mas não foi possível associar os exercícios.",
        );
    }
  } else {
    // Suporte para formato antigo (compatibilidade)
    const exercicio = String(form.get("exercicio_id") ?? "");
    if (exercicio) {
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

  const { data: treino } = await supabase
    .from("treinos")
    .select("id,nome")
    .eq("id", treinoId)
    .eq("usuario_id", user.id)
    .eq("ativo", true)
    .single();

  if (!treino) throw new Error("Treino indisponivel.");

  const { data, error } = await supabase
    .from("execucoes_treino")
    .insert({
      usuario_id: user.id,
      treino_id: treinoId,
      nome_treino: nome || treino.nome,
    })
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
  const ordemExercicio = Number(form.get("ordem_exercicio") ?? 1);

  const [{ data: execucao }, { data: exercicio }] = await Promise.all([
    supabase
      .from("execucoes_treino")
      .select("id")
      .eq("id", execucaoId)
      .eq("usuario_id", user.id)
      .eq("status", "EM_ANDAMENTO")
      .single(),
    supabase
      .from("exercicios")
      .select("id,nome")
      .eq("id", exercicioId)
      .eq("usuario_id", user.id)
      .single(),
  ]);

  if (!execucao || !exercicio) {
    throw new Error("Execucao ou exercicio indisponivel.");
  }

  const { count } = await supabase
    .from("series_executadas")
    .select("id", { count: "exact", head: true })
    .eq("execucao_id", execucaoId)
    .eq("ordem_exercicio", ordemExercicio)
    .eq("usuario_id", user.id);
  const { error } = await supabase
    .from("series_executadas")
    .insert({
      usuario_id: user.id,
      execucao_id: execucaoId,
      exercicio_id: exercicioId,
      nome_exercicio: nome,
      ordem_exercicio: ordemExercicio,
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
    .update({
      status: "CONCLUIDA",
      concluida_em: new Date().toISOString(),
    })
    .eq("id", String(form.get("execucao_id")))
    .eq("usuario_id", user.id);
  if (error) throw new Error("Não foi possível concluir o treino.");
  revalidatePath("/");
  revalidatePath("/historico");
  redirect("/historico");
}
