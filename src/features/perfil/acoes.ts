"use server";

import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/autenticacao/usuario";
import {
  emailSchema,
  novaSenhaSchema,
  perfilSchema,
  senhaSchema,
  type EstadoFormulario,
} from "./validacoes";

function camposDoErro(erro: {
  flatten: () => { fieldErrors: Record<string, string[]> };
}) {
  return erro.flatten().fieldErrors;
}

export async function atualizarPerfil(
  _: EstadoFormulario,
  form: FormData,
): Promise<EstadoFormulario> {
  const validacao = perfilSchema.safeParse({
    nome: form.get("nome"),
    altura_cm: form.get("altura_cm"),
    peso_kg: form.get("peso_kg"),
  });
  if (!validacao.success)
    return {
      erro: "Revise os campos informados.",
      campos: camposDoErro(validacao.error),
    };
  const { supabase, user } = await exigirUsuario();
  const { error } = await supabase
    .from("perfis")
    .upsert({
      id: user.id,
      ...validacao.data,
      atualizado_em: new Date().toISOString(),
    });
  if (error) return { erro: "Não foi possível salvar seus dados." };
  revalidatePath("/perfil");
  return { sucesso: "Dados pessoais atualizados." };
}

export async function alterarEmail(
  _: EstadoFormulario,
  form: FormData,
): Promise<EstadoFormulario> {
  const validacao = emailSchema.safeParse({ email: form.get("email") });
  if (!validacao.success)
    return {
      erro: "Informe um e-mail válido.",
      campos: camposDoErro(validacao.error),
    };
  const { supabase, user } = await exigirUsuario();
  if (validacao.data.email.toLowerCase() === user.email?.toLowerCase())
    return { erro: "Esse já é o seu e-mail atual." };
  const origem = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.updateUser(
    { email: validacao.data.email },
    { emailRedirectTo: `${origem}/auth/confirmar?next=/perfil` },
  );
  if (error)
    return { erro: "Não foi possível solicitar a alteração do e-mail." };
  return { sucesso: "Enviamos confirmações para os endereços necessários." };
}

export async function alterarSenha(
  _: EstadoFormulario,
  form: FormData,
): Promise<EstadoFormulario> {
  const validacao = senhaSchema.safeParse({
    senha_atual: form.get("senha_atual"),
    nova_senha: form.get("nova_senha"),
    confirmar_senha: form.get("confirmar_senha"),
  });
  if (!validacao.success)
    return {
      erro: "Revise as senhas informadas.",
      campos: camposDoErro(validacao.error),
    };
  const { supabase } = await exigirUsuario();
  const { error } = await supabase.auth.updateUser({
    password: validacao.data.nova_senha,
    current_password: validacao.data.senha_atual,
  });
  if (error) return { erro: "Senha atual incorreta ou nova senha inválida." };
  return { sucesso: "Senha alterada com segurança." };
}

export async function definirNovaSenha(
  _: EstadoFormulario,
  form: FormData,
): Promise<EstadoFormulario> {
  const validacao = novaSenhaSchema.safeParse({
    nova_senha: form.get("nova_senha"),
    confirmar_senha: form.get("confirmar_senha"),
  });
  if (!validacao.success)
    return {
      erro: "Revise as senhas informadas.",
      campos: camposDoErro(validacao.error),
    };
  const { supabase } = await exigirUsuario();
  const { error } = await supabase.auth.updateUser({
    password: validacao.data.nova_senha,
  });
  return error
    ? { erro: "Não foi possível alterar a senha. Solicite um novo link." }
    : { sucesso: "Senha redefinida. Você já pode continuar usando o Movz." };
}
