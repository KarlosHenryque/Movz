"use client";
import { useRef, useState } from "react";
import { Play, Plus, Pencil, Trash2, X } from "lucide-react";
import { excluirTreino, iniciarTreino, salvarTreino } from "./acoes";
type Exercicio = { id: string; nome: string };
type Treino = {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  exercicios_treino: Array<{
    exercicio_id: string;
    series_planejadas: number;
    repeticoes_planejadas: string;
    carga_sugerida: number | null;
    descanso_segundos: number;
  }>;
};
function Formulario({
  item,
  exercicios,
  fechar,
}: {
  item?: Treino;
  exercicios: Exercicio[];
  fechar: () => void;
}) {
  const plano = item?.exercicios_treino[0];
  return (
    <form
      action={async (f) => {
        await salvarTreino(f);
        fechar();
      }}
      className="formulario"
    >
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <label>
        Nome
        <input name="nome" defaultValue={item?.nome} required />
      </label>
      <label>
        Descrição
        <textarea name="descricao" defaultValue={item?.descricao ?? ""} />
      </label>
      <label>
        Exercício
        <select name="exercicio_id" defaultValue={plano?.exercicio_id}>
          <option value="">Sem exercício</option>
          {exercicios.map((e) => (
            <option value={e.id} key={e.id}>
              {e.nome}
            </option>
          ))}
        </select>
      </label>
      <div className="campos-duplos">
        <label>
          Séries
          <input
            name="series"
            type="number"
            min="1"
            max="20"
            defaultValue={plano?.series_planejadas ?? 3}
          />
        </label>
        <label>
          Repetições
          <input
            name="repeticoes"
            defaultValue={plano?.repeticoes_planejadas ?? "10"}
          />
        </label>
        <label>
          Carga sugerida
          <input
            name="carga"
            type="number"
            min="0"
            step="0.5"
            defaultValue={plano?.carga_sugerida ?? 0}
          />
        </label>
        <label>
          Descanso (s)
          <input
            name="descanso"
            type="number"
            min="0"
            max="3600"
            defaultValue={plano?.descanso_segundos ?? 60}
          />
        </label>
      </div>
      <label className="check">
        <input
          type="checkbox"
          name="ativo"
          value="true"
          defaultChecked={item?.ativo ?? true}
        />{" "}
        Ativo
      </label>
      <button className="botao primario">Salvar treino</button>
    </form>
  );
}
export function GerenciadorTreinos({
  itens,
  exercicios,
}: {
  itens: Treino[];
  exercicios: Exercicio[];
}) {
  const [aberto, setAberto] = useState<Treino | null | undefined>();
  const dialog = useRef<HTMLDialogElement>(null);
  const abrir = (i: Treino | null) => {
    setAberto(i);
    dialog.current?.showModal();
  };
  const fechar = () => {
    dialog.current?.close();
    setAberto(undefined);
  };
  return (
    <>
      <button className="botao primario" onClick={() => abrir(null)}>
        <Plus size={18} />
        Novo treino
      </button>
      <div className="grade lista-cards">
        {itens.map((i) => (
          <article className="cartao" key={i.id}>
            <div className="linha">
              <div>
                <span className={i.ativo ? "status ativo" : "status"}>
                  {i.ativo ? "Ativo" : "Inativo"}
                </span>
                <h2>{i.nome}</h2>
              </div>
            </div>
            <p className="muted">
              {i.descricao || `${i.exercicios_treino.length} exercício(s)`}
            </p>
            <div className="acoes-item">
              {i.ativo && i.exercicios_treino.length > 0 && (
                <form action={iniciarTreino}>
                  <input type="hidden" name="id" value={i.id} />
                  <input type="hidden" name="nome" value={i.nome} />
                  <button className="botao primario">
                    <Play size={16} />
                    Iniciar
                  </button>
                </form>
              )}
              <button className="botao secundario" onClick={() => abrir(i)}>
                <Pencil size={16} />
                Editar
              </button>
              <form
                action={excluirTreino}
                onSubmit={(e) => {
                  if (!confirm(`Excluir ${i.nome}?`)) e.preventDefault();
                }}
              >
                <input type="hidden" name="id" value={i.id} />
                <button className="botao perigo">
                  <Trash2 size={16} />
                  Excluir
                </button>
              </form>
            </div>
          </article>
        ))}
        {!itens.length && (
          <div className="cartao vazio">
            <span>🏋️</span>
            <h2>Monte sua primeira ficha</h2>
            <p>Cadastre antes um exercício e depois crie seu treino.</p>
          </div>
        )}
      </div>
      <dialog ref={dialog} className="modal">
        <div className="linha">
          <h2>{aberto ? "Editar treino" : "Novo treino"}</h2>
          <button className="icone" onClick={fechar} aria-label="Fechar">
            <X />
          </button>
        </div>
        {aberto !== undefined && (
          <Formulario
            item={aberto ?? undefined}
            exercicios={exercicios}
            fechar={fechar}
          />
        )}
      </dialog>
    </>
  );
}
