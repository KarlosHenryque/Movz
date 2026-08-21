import { Cabecalho } from "@/components/cabecalho";
import { sair } from "@/features/autenticacao/acoes";
import { FormularioPerfil } from "@/features/perfil/formulario-perfil";
import { exigirUsuario } from "@/lib/autenticacao/usuario";
export default async function Page() {
  const { supabase, user } = await exigirUsuario();
  const { data } = await supabase.from("perfis").select("nome, altura_cm, peso_kg").eq("id", user.id).maybeSingle();
  return <><Cabecalho titulo="Perfil" subtitulo="Dados pessoais e segurança"/><FormularioPerfil nome={data?.nome ?? user.user_metadata.nome ?? ""} email={user.email ?? ""} altura={data?.altura_cm?.toString() ?? ""} peso={data?.peso_kg?.toString() ?? ""}/><section className="cartao zona-conta"><h2>Sessão</h2><p className="muted">Saia da sua conta neste dispositivo.</p><form action={sair}><button className="botao secundario">Sair da conta</button></form></section></>;
}
