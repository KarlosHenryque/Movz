"use client";
import { useActionState } from "react";
import { definirNovaSenha } from "./acoes";
export function FormularioNovaSenha() {
  const [estado, acao, pendente] = useActionState(definirNovaSenha, {});
  return (
    <form action={acao} className="formulario">
      <label>
        Nova senha
        <input
          name="nova_senha"
          type="password"
          autoComplete="new-password"
          minLength={12}
          pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{12,}"
          title="Use pelo menos 12 caracteres, com letra maiúscula, minúscula, número e símbolo."
          required
        />
      </label>
      <label>
        Confirmar nova senha
        <input
          name="confirmar_senha"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
        />
      </label>
      {estado.erro && (
        <p className="alerta erro" role="alert">
          {estado.erro}
        </p>
      )}
      {estado.sucesso && (
        <p className="alerta sucesso" role="status">
          {estado.sucesso}
        </p>
      )}
      <button className="botao primario" disabled={pendente}>
        {pendente ? "Salvando..." : "Definir nova senha"}
      </button>
    </form>
  );
}
