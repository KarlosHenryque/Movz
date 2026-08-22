"use server";
import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/autenticacao/usuario";
import { despesaSchema } from "./validacoes";
export async function salvarDespesa(form: FormData) {
  const entrada = despesaSchema.parse({
    descricao: form.get("descricao"),
    valor: form.get("valor"),
    categoria_id: form.get("categoria_id"),
    data: form.get("data"),
    tipo: form.get("tipo"),
    observacao: String(form.get("observacao") ?? ""),
  });
  const id = String(form.get("id") ?? "");
  const { supabase, user } = await exigirUsuario();
  const registro = {
    ...entrada,
    data: entrada.data.toISOString().slice(0, 10),
    usuario_id: user.id,
  };
  const consulta = id
    ? supabase
        .from("despesas")
        .update(registro)
        .eq("id", id)
        .eq("usuario_id", user.id)
    : supabase.from("despesas").insert(registro);
  const { error } = await consulta;
  if (error) throw new Error("Não foi possível salvar a despesa.");
  revalidatePath("/financeiro");
  revalidatePath("/");
}
export async function excluirDespesa(form: FormData) {
  const { supabase, user } = await exigirUsuario();
  const { error } = await supabase
    .from("despesas")
    .delete()
    .eq("id", String(form.get("id") ?? ""))
    .eq("usuario_id", user.id);
  if (error) throw new Error("Não foi possível excluir a despesa.");
  revalidatePath("/financeiro");
  revalidatePath("/");
}
