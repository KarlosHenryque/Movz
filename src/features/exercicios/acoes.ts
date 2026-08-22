"use server";
import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/autenticacao/usuario";
import { exercicioSchema } from "./validacoes";
function dados(form: FormData) {
  return {
    nome: form.get("nome"),
    grupo_muscular: form.get("grupo_muscular"),
    descricao: String(form.get("descricao") ?? ""),
    observacoes: String(form.get("observacoes") ?? ""),
    ativo: form.get("ativo") === "true",
  };
}
export async function salvarExercicio(form: FormData) {
  const entrada = exercicioSchema.parse(dados(form));
  const id = String(form.get("id") ?? "");
  const { supabase, user } = await exigirUsuario();
  const consulta = id
    ? supabase
        .from("exercicios")
        .update({ ...entrada, atualizado_em: new Date().toISOString() })
        .eq("id", id)
        .eq("usuario_id", user.id)
    : supabase.from("exercicios").insert({ ...entrada, usuario_id: user.id });
  const { error } = await consulta;
  if (error) throw new Error("Não foi possível salvar o exercício.");
  revalidatePath("/exercicios");
}
export async function excluirExercicio(form: FormData) {
  const id = String(form.get("id") ?? "");
  const { supabase, user } = await exigirUsuario();
  const { error } = await supabase
    .from("exercicios")
    .delete()
    .eq("id", id)
    .eq("usuario_id", user.id);
  if (error)
    throw new Error(
      "Exercícios usados em treinos não podem ser excluídos; desative-os pela edição.",
    );
  revalidatePath("/exercicios");
}
