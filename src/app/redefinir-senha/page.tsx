import { FormularioNovaSenha } from "@/features/perfil/formulario-nova-senha";
import { exigirUsuario } from "@/lib/autenticacao/usuario";
export default async function Page() {
  await exigirUsuario();
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="marca">
          movz<span>.</span>
        </div>
        <h1>Nova senha</h1>
        <p className="muted">
          Crie uma senha com pelo menos 12 caracteres, incluindo maiúscula,
          minúscula, número e símbolo.
        </p>
        <FormularioNovaSenha />
      </section>
    </main>
  );
}
