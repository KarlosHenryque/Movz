import { FormularioAuth } from "@/components/formulario-auth"; import { cadastrar } from "@/features/autenticacao/acoes";
export default async function Page({ searchParams }: PageProps<"/cadastro">) { const q = await searchParams; return <FormularioAuth titulo="Criar conta" acao={cadastrar} cadastro erro={String(q.erro ?? "") || undefined} />; }
