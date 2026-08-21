import { FormularioNovaSenha } from "@/features/perfil/formulario-nova-senha";
import { exigirUsuario } from "@/lib/autenticacao/usuario";
export default async function Page() { await exigirUsuario(); return <main className="auth-shell"><section className="auth-card"><div className="marca">movz<span>.</span></div><h1>Nova senha</h1><p className="muted">Crie uma senha segura com pelo menos 8 caracteres.</p><FormularioNovaSenha/></section></main>; }
