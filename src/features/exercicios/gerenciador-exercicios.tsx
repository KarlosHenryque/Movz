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
  const [erro, setErro] = useState<string | null>(null);
  const enviandoRef = useRef(false);

  const handleSalvar = async (formData: FormData) => {
    if (enviandoRef.current) return;

    try {
      enviandoRef.current = true;
      setErro(null);
      setCarregando(true);
      await salvarExercicio(formData);
      router.refresh();
      fechar();
    } catch (err: unknown) {
      enviandoRef.current = false;
      setCarregando(false);
      if (err instanceof Error) {
        setErro(err.message);
      } else {
        setErro("Não foi possível salvar o exercício.");
      }
    }
  };

  return (
    <form action={handleSalvar} className="formulario">
      {erro && (
        <p className="alerta erro" role="alert">
          {erro}
        </p>
      )}
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <label>
        Nome
        <input
          name="nome"
          defaultValue={item?.nome ?? ""}
          required
          minLength={2}
          disabled={carregando}
          placeholder="Ex.: Supino Reto"
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
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>
      <label>
        Descrição
        <textarea
          name="descricao"
          defaultValue={item?.descricao ?? ""}
          disabled={carregando}
          placeholder="Ex.: Movimento principal para peito"
        />
      </label>
      <label>
        Observações
        <textarea
          name="observacoes"
          defaultValue={item?.observacoes ?? ""}
          disabled={carregando}
          placeholder="Ex.: Ajustar banco e amplitude conforme conforto"
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
      <button type="submit" className="botao primario" disabled={carregando}>
        {carregando
          ? "Salvando..."
          : item
            ? "Salvar alterações"
            : "Salvar exercício"}
      </button>
    </form>
  );
}

export function GerenciadorExercicios({ itens }: { itens: Exercicio[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<Exercicio | null | undefined>();
  const [carregandoExclusao, setCarregandoExclusao] = useState<string | null>(
    null,
  );
  const [erro, setErro] = useState<string | null>(null);
  const exclusaoRef = useRef<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const filtrados = useMemo(
    () => {
      const termo = busca.trim().toLowerCase();

      if (!termo) {
        return itens;
      }

      return itens.filter((i) =>
        `${i.nome} ${i.grupo_muscular}`.toLowerCase().includes(termo)
      );
    },
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

  const handleExcluir = async (id: string, formData: FormData) => {
    if (exclusaoRef.current) return;

    try {
      exclusaoRef.current = id;
      setErro(null);
      setCarregandoExclusao(id);
      await excluirExercicio(formData);
      router.refresh();
    } catch (err: unknown) {
      console.error("Erro ao excluir exercício:", err);
      setErro(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o exercício.",
      );
    } finally {
      exclusaoRef.current = null;
      setCarregandoExclusao(null);
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
      <button
        type="button"
        className="botao primario"
        onClick={() => abrir(null)}
      >
        <Plus size={18} />
        Novo exercício
      </button>
      {erro && (
        <p className="alerta erro" role="alert">
          {erro}
        </p>
      )}
      <div className="lista-cards lista-exercicios-cards">
        {filtrados.map((i) => (
          <article className="cartao cartao-exercicio" key={i.id}>
            <div className="exercicio-cabecalho">
              <div className="exercicio-identificacao">
                <span className="selo neutro">{i.grupo_muscular}</span>
                <h2>{i.nome}</h2>
              </div>
            </div>

            <div className="acoes-item exercicio-acoes">
              <span className={i.ativo ? "status ativo" : "status"}>
                {i.ativo ? "Ativo" : "Inativo"}
              </span>
              <button
                type="button"
                className="botao secundario"
                onClick={() => abrir(i)}
                disabled={carregandoExclusao !== null}
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
                  type="submit"
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
