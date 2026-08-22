"use client";
import { useMemo, useRef, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { excluirExercicio, salvarExercicio } from "./acoes";
import { gruposMusculares } from "./validacoes";
type Exercicio = {
  id: string;
  nome: string;
  grupo_muscular: string;
  descricao: string | null;
  observacoes: string | null;
  ativo: boolean;
};
function Formulario({
  item,
  fechar,
}: {
  item?: Exercicio;
  fechar: () => void;
}) {
  return (
    <form
      action={async (f) => {
        await salvarExercicio(f);
        fechar();
      }}
      className="formulario"
    >
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <label>
        Nome
        <input name="nome" defaultValue={item?.nome} required minLength={2} />
      </label>
      <label>
        Grupo muscular
        <select
          name="grupo_muscular"
          defaultValue={item?.grupo_muscular ?? "PEITO"}
        >
          {gruposMusculares.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </label>
      <label>
        Descrição
        <textarea name="descricao" defaultValue={item?.descricao ?? ""} />
      </label>
      <label>
        Observações
        <textarea name="observacoes" defaultValue={item?.observacoes ?? ""} />
      </label>
      <label className="check">
        <input
          type="checkbox"
          name="ativo"
          value="true"
          defaultChecked={item?.ativo ?? true}
        />{" "}
        Ativo
      </label>
      <button className="botao primario">Salvar exercício</button>
    </form>
  );
}
export function GerenciadorExercicios({ itens }: { itens: Exercicio[] }) {
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<Exercicio | null | undefined>();
  const dialog = useRef<HTMLDialogElement>(null);
  const filtrados = useMemo(
    () =>
      itens.filter((i) =>
        `${i.nome} ${i.grupo_muscular}`
          .toLowerCase()
          .includes(busca.toLowerCase()),
      ),
    [itens, busca],
  );
  const abrir = (i: Exercicio | null) => {
    setAberto(i);
    dialog.current?.showModal();
  };
  const fechar = () => {
    dialog.current?.close();
    setAberto(undefined);
  };
  return (
    <>
      <div className="barra-busca">
        <Search size={18} />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar exercícios..."
          aria-label="Buscar exercícios"
        />
      </div>
      <button className="botao primario" onClick={() => abrir(null)}>
        <Plus size={18} />
        Novo exercício
      </button>
      <div className="grade lista-cards">
        {filtrados.map((i) => (
          <article className="cartao" key={i.id}>
            <div className="linha">
              <div>
                <span className="selo neutro">{i.grupo_muscular}</span>
                <h2>{i.nome}</h2>
              </div>
              <span className={i.ativo ? "status ativo" : "status"}>
                {i.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
            {i.descricao && <p className="muted">{i.descricao}</p>}
            <div className="acoes-item">
              <button className="botao secundario" onClick={() => abrir(i)}>
                <Pencil size={16} />
                Editar
              </button>
              <form
                action={excluirExercicio}
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
        {filtrados.length === 0 && (
          <div className="cartao vazio">
            <span>✦</span>
            <h2>Nenhum exercício encontrado</h2>
            <p>
              {busca
                ? "Tente outro termo."
                : "Cadastre seu primeiro exercício para montar treinos."}
            </p>
          </div>
        )}
      </div>
      <dialog
        ref={dialog}
        className="modal"
        onClose={() => setAberto(undefined)}
      >
        <div className="linha">
          <h2>{aberto ? "Editar exercício" : "Novo exercício"}</h2>
          <button className="icone" onClick={fechar} aria-label="Fechar">
            <X />
          </button>
        </div>
        {aberto !== undefined && (
          <Formulario item={aberto ?? undefined} fechar={fechar} />
        )}
      </dialog>
    </>
  );
}
