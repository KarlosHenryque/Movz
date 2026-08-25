"use client";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Modal } from "@/components/modal";
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
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  const handleSalvar = async (formData: FormData) => {
    try {
      setCarregando(true);
      await salvarExercicio(formData);
      router.refresh();
      fechar();
    } catch (err) {
      setCarregando(false);
      throw err;
    }
  };

  return (
    <form action={handleSalvar} className="formulario">
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <label>
        Nome
        <input
          name="nome"
          defaultValue={item?.nome}
          required
          minLength={2}
          disabled={carregando}
        />
      </label>
      <label>
        Grupo muscular
        <select
          name="grupo_muscular"
          defaultValue={item?.grupo_muscular ?? "PEITO"}
          disabled={carregando}
        >
          {gruposMusculares.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </label>
      <label>
        Descrição
        <textarea
          name="descricao"
          defaultValue={item?.descricao ?? ""}
          disabled={carregando}
        />
      </label>
      <label>
        Observações
        <textarea
          name="observacoes"
          defaultValue={item?.observacoes ?? ""}
          disabled={carregando}
        />
      </label>
      <label className="switch-campo">
        <span>Exercício ativo</span>
        <span className="switch">
          <input
            type="checkbox"
            name="ativo"
            value="true"
            defaultChecked={item?.ativo ?? true}
            disabled={carregando}
          />
          <span className="switch-slider" aria-hidden="true" />
        </span>
      </label>
      <button className="botao primario" disabled={carregando}>
        {carregando ? "Salvando..." : "Salvar exercício"}
      </button>
    </form>
  );
}

export function GerenciadorExercicios({ itens }: { itens: Exercicio[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<Exercicio | null | undefined>();
  const [carregandoExclusao, setCarregandoExclusao] = useState<string | null>(
    null
  );
  const dialog = useRef<HTMLDialogElement>(null);

  const filtrados = useMemo(
    () =>
      itens.filter((i) =>
        `${i.nome} ${i.grupo_muscular}`.toLowerCase().includes(busca.toLowerCase())
      ),
    [itens, busca]
  );

  const abrir = (i: Exercicio | null) => {
    setAberto(i);
    dialog.current?.showModal();
  };

  const fechar = () => {
    dialog.current?.close();
    setAberto(undefined);
  };

  const handleExcluir = async (id: string, formData: FormData) => {
    try {
      setCarregandoExclusao(id);
      await excluirExercicio(formData);
      router.refresh();
    } catch (err) {
      setCarregandoExclusao(null);
      throw err;
    }
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
              <button
                className="botao secundario"
                onClick={() => abrir(i)}
              >
                <Pencil size={16} />
                Editar
              </button>
              <form
                action={(f) => handleExcluir(i.id, f)}
                onSubmit={(e) => {
                  if (
                    carregandoExclusao === i.id ||
                    !confirm(`Excluir ${i.nome}?`)
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="id" value={i.id} />
                <button
                  className="botao perigo"
                  disabled={carregandoExclusao === i.id}
                >
                  <Trash2 size={16} />
                  {carregandoExclusao === i.id ? "Excluindo..." : "Excluir"}
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
      <Modal
        dialogRef={dialog}
        aberto={aberto !== undefined}
        titulo={aberto ? "Editar exercício" : "Novo exercício"}
        fechar={fechar}
      >
        {aberto !== undefined && (
          <Formulario item={aberto ?? undefined} fechar={fechar} />
        )}
      </Modal>
    </>
  );
}
