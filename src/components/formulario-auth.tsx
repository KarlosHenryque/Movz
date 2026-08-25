import Link from "next/link";
import { BotaoSubmit } from "./botao-submit";

type FormularioAuthProps = {
  titulo: string;
  acao: (form: FormData) => Promise<void>;
  cadastro?: boolean;
  recuperar?: boolean;
  erro?: string;
  mensagem?: string;
};

export function FormularioAuth({ titulo, acao, cadastro = false, recuperar = false, erro, mensagem }: FormularioAuthProps) {
  return <main className="auth-shell"><section className="auth-card">
    <div className="marca">movz<span>.</span></div>
    <h1>{titulo}</h1><p className="muted">Seu treino e suas finanças, em movimento.</p>
    {erro && <p className="alerta erro" role="alert">{erro}</p>}
    {mensagem && <p className="alerta sucesso" role="status">{mensagem}</p>}
    <form action={acao} className="formulario">
      {cadastro && <label>Nome<input name="nome" required minLength={2} maxLength={120} autoComplete="name" /></label>}
      <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
      {!recuperar && <label>Senha<input name="senha" type="password" minLength={cadastro ? 12 : 8} pattern={cadastro ? "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{12,}" : undefined} title={cadastro ? "Use 12 caracteres ou mais, com maiúscula, minúscula, número e símbolo." : undefined} required autoComplete={cadastro ? "new-password" : "current-password"} />{cadastro && <small className="muted">Use 12 caracteres ou mais, com maiúscula, minúscula, número e símbolo.</small>}</label>}
      <BotaoSubmit className="botao primario" pendente="Aguarde...">{titulo}</BotaoSubmit>
    </form>
    <div className="links-auth">{!cadastro && !recuperar && <><Link href="/recuperar">Esqueci minha senha</Link><Link href="/cadastro">Criar conta</Link></>}{(cadastro || recuperar) && <Link href="/entrar">Voltar para entrar</Link>}</div>
  </section></main>;
}
