import { Cabecalho } from "@/components/cabecalho";
import { GerenciadorExercicios } from "@/features/exercicios/gerenciador-exercicios";
import { exigirUsuario } from "@/lib/autenticacao/usuario";
export default async function Page(){const{supabase,user}=await exigirUsuario();const{data}=await supabase.from("exercicios").select("id,nome,grupo_muscular,descricao,observacoes,ativo").eq("usuario_id",user.id).order("nome");return <><Cabecalho titulo="Exercícios" subtitulo="Sua biblioteca de movimentos"/><GerenciadorExercicios itens={data??[]}/></>}
