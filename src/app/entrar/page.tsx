import { FormularioAuth } from "@/components/formulario-auth"; import { entrar } from "@/features/autenticacao/acoes";
export default async function Page({ searchParams }: PageProps<"/entrar">) { const q = await searchParams; return <FormularioAuth titulo="Entrar" acao={entrar} erro={String(q.erro ?? "") || undefined} mensagem={String(q.mensagem ?? "") || undefined} />; }
