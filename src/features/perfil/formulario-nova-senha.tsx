"use client";
import { useActionState } from "react";
import { definirNovaSenha } from "./acoes";
export function FormularioNovaSenha() { const [estado, acao, pendente] = useActionState(definirNovaSenha, {}); return <form action={acao} className="formulario"><label>Nova senha<input name="nova_senha" type="password" autoComplete="new-password" required minLength={8}/></label><label>Confirmar nova senha<input name="confirmar_senha" type="password" autoComplete="new-password" required minLength={8}/></label>{estado.erro && <p className="alerta erro" role="alert">{estado.erro}</p>}{estado.sucesso && <p className="alerta sucesso" role="status">{estado.sucesso}</p>}<button className="botao primario" disabled={pendente}>{pendente ? "Salvando..." : "Definir nova senha"}</button></form>; }
