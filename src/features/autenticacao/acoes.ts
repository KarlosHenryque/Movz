"use server";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { senhaForteSchema } from "@/features/perfil/validacoes";

function valor(form: FormData, nome: string) { return String(form.get(nome) ?? "").trim(); }
export async function entrar(form: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email: valor(form, "email"), password: valor(form, "senha") });
  if (error) redirect(`/entrar?erro=${encodeURIComponent("E-mail ou senha inválidos")}`);
  redirect("/");
}
export async function cadastrar(form: FormData) {
  const senha = senhaForteSchema.safeParse(String(form.get("senha") ?? ""));
  if (!senha.success)
    redirect(`/cadastro?erro=${encodeURIComponent(senha.error.issues[0].message)}`);
  const supabase = await criarClienteServidor();
  const origem = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signUp({ email: valor(form, "email"), password: senha.data, options: { data: { nome: valor(form, "nome") }, emailRedirectTo: `${origem}/auth/confirmar` } });
  if (error) redirect(`/cadastro?erro=${encodeURIComponent(error.message)}`);
  redirect("/entrar?mensagem=Confira seu e-mail para confirmar o cadastro");
}
export async function recuperar(form: FormData) {
  const supabase = await criarClienteServidor();
  const origem = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(valor(form, "email"), { redirectTo: `${origem}/auth/confirmar?next=/redefinir-senha` });
  redirect("/entrar?mensagem=Se o e-mail existir, enviaremos as instruções");
}
export async function sair() { const supabase = await criarClienteServidor(); await supabase.auth.signOut(); redirect("/entrar"); }
