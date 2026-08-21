"use client";
import { useActionState } from "react";
import { alterarEmail, alterarSenha, atualizarPerfil } from "./acoes";
import type { EstadoFormulario } from "./validacoes";
const inicial: EstadoFormulario = {};
function Retorno({ estado }: { estado: EstadoFormulario }) { if (estado.erro) return <p className="alerta erro" role="alert">{estado.erro}</p>; if (estado.sucesso) return <p className="alerta sucesso" role="status">{estado.sucesso}</p>; return null; }
function ErroCampo({ estado, nome }: { estado: EstadoFormulario; nome: string }) { const erro = estado.campos?.[nome]?.[0]; return erro ? <small className="erro-campo">{erro}</small> : null; }
export function FormularioPerfil({ nome, email, altura, peso }: { nome: string; email: string; altura: string; peso: string }) {
  const [perfil, acaoPerfil, salvandoPerfil] = useActionState(atualizarPerfil, inicial);
  const [estadoEmail, acaoEmail, salvandoEmail] = useActionState(alterarEmail, inicial);
  const [senha, acaoSenha, salvandoSenha] = useActionState(alterarSenha, inicial);
  return <div className="grade perfil-grade">
    <section className="cartao"><h2>Dados pessoais</h2><p className="muted">Mantenha seus dados físicos atualizados para acompanhar sua evolução.</p><form action={acaoPerfil} className="formulario">
      <label>Nome<input name="nome" defaultValue={nome} autoComplete="name" required maxLength={120}/><ErroCampo estado={perfil} nome="nome"/></label>
      <div className="campos-duplos"><label>Altura (cm)<input name="altura_cm" defaultValue={altura} type="number" inputMode="decimal" min="50" max="300" step="0.1" placeholder="175"/><ErroCampo estado={perfil} nome="altura_cm"/></label><label>Peso (kg)<input name="peso_kg" defaultValue={peso} type="number" inputMode="decimal" min="20" max="500" step="0.1" placeholder="75"/><ErroCampo estado={perfil} nome="peso_kg"/></label></div>
      <Retorno estado={perfil}/><button className="botao primario" disabled={salvandoPerfil}>{salvandoPerfil ? "Salvando..." : "Salvar dados"}</button>
    </form></section>
    <section className="cartao"><h2>Alterar e-mail</h2><p className="muted">Você receberá uma confirmação para proteger sua conta.</p><form action={acaoEmail} className="formulario">
      <label>Novo e-mail<input name="email" defaultValue={email} type="email" autoComplete="email" required/><ErroCampo estado={estadoEmail} nome="email"/></label><Retorno estado={estadoEmail}/><button className="botao primario" disabled={salvandoEmail}>{salvandoEmail ? "Enviando..." : "Solicitar alteração"}</button>
    </form></section>
    <section className="cartao"><h2>Alterar senha</h2><p className="muted">Use pelo menos 8 caracteres e uma senha diferente da atual.</p><form action={acaoSenha} className="formulario">
      <label>Senha atual<input name="senha_atual" type="password" autoComplete="current-password" required minLength={8}/><ErroCampo estado={senha} nome="senha_atual"/></label><label>Nova senha<input name="nova_senha" type="password" autoComplete="new-password" required minLength={8}/><ErroCampo estado={senha} nome="nova_senha"/></label><label>Confirmar nova senha<input name="confirmar_senha" type="password" autoComplete="new-password" required minLength={8}/><ErroCampo estado={senha} nome="confirmar_senha"/></label>
      <Retorno estado={senha}/><button className="botao primario" disabled={salvandoSenha}>{salvandoSenha ? "Alterando..." : "Alterar senha"}</button>
    </form></section>
  </div>;
}
