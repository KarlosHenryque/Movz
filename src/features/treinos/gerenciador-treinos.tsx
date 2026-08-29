"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Circle,
  EllipsisVertical,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { Modal } from "@/components/modal";
import { BotaoSubmit } from "@/components/botao-submit";

import {
  excluirTreino,
  iniciarTreino,
  salvarTreino,
} from "./acoes";

type Exercicio = {
  id: number;
  nome: string;
};

type ExercicioTreino = {
  id: number;
  exercicio_id: number;
  ordem: number;
  series_planejadas: number;
  repeticoes_planejadas: string;
  carga_sugerida: number | null;
  descanso_segundos: number;

  exercicios?: {
    nome: string;
    grupo_muscular: string;
  } | null;
};

type Treino = {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  exercicios_treino: ExercicioTreino[];
};

type ExercicioForm = {
  exercicio_id: number;
  series: string;
  repeticoes: string;
  carga: string;
  descanso: string;
  nome?: string;
};

function FormularioTreino({
  item,
  exercicios,
  fechar,
}: {
  item?: Treino;
  exercicios: Exercicio[];
  fechar: () => void;
}) {
  const router = useRouter();

  const [carregando, setCarregando] = useState(false);

  const [exerciciosAdicionados, setExerciciosAdicionados] = useState<
    ExercicioForm[]
  >(
    item?.exercicios_treino.map((e) => ({
      exercicio_id: e.exercicio_id,
      series: String(e.series_planejadas),
      repeticoes: e.repeticoes_planejadas,
      carga: String(e.carga_sugerida ?? 0),
      descanso: String(e.descanso_segundos),
      nome: e.exercicios?.nome,
    })) ?? [],
  );

  const [selecionadoAtual, setSelecionadoAtual] = useState<number | null>(null);

  const adicionarExercicio = () => {
    if (selecionadoAtual === null) {
      return;
    }

    const exercicio = exercicios.find(
      (e) => e.id === selecionadoAtual,
    );

    if (!exercicio) {
      return;
    }

    const jaAdicionado = exerciciosAdicionados.some(
      (item) => item.exercicio_id === exercicio.id,
    );

    if (jaAdicionado) {
      setSelecionadoAtual(null);
      return;
    }

    setExerciciosAdicionados((anteriores) => [
      ...anteriores,
      {
        exercicio_id: exercicio.id,
        series: "3",
        repeticoes: "10",
        carga: "0",
        descanso: "60",
        nome: exercicio.nome,
      },
    ]);

    setSelecionadoAtual(null);
  };

  const atualizarExercicio = (
    index: number,
    campo: keyof ExercicioForm,
    valor: string,
  ) => {
    setExerciciosAdicionados((anteriores) =>
      anteriores.map((exercicio, indice) =>
        indice === index
          ? {
              ...exercicio,
              [campo]: valor,
            }
          : exercicio,
      ),
    );
  };

  const removerExercicio = (index: number) => {
    setExerciciosAdicionados((anteriores) =>
      anteriores.filter((_, indice) => indice !== index),
    );
  };

  const handleSalvar = async (formData: FormData) => {
    if (carregando) {
      return;
    }

    try {
      setCarregando(true);

      exerciciosAdicionados.forEach((exercicio, indice) => {
        formData.append(
          `exercicio_${indice}_id`,
          String(exercicio.exercicio_id),
        );

        formData.append(
          `exercicio_${indice}_series`,
          exercicio.series,
        );

        formData.append(
          `exercicio_${indice}_repeticoes`,
          exercicio.repeticoes,
        );

        formData.append(
          `exercicio_${indice}_carga`,
          exercicio.carga,
        );

        formData.append(
          `exercicio_${indice}_descanso`,
          exercicio.descanso,
        );
      });

      formData.append(
        "exercicios_count",
        String(exerciciosAdicionados.length),
      );

      await salvarTreino(formData);

      router.refresh();

      fechar();
    } catch (erro) {
      console.error("Erro ao salvar treino:", erro);
      setCarregando(false);
    }
  };

  return (
    <form action={handleSalvar} className="formulario">
      <input
        type="hidden"
        name="id"
        value={item?.id ?? ""}
      />

      <label>
        Nome

        <input
          name="nome"
          defaultValue={item?.nome ?? ""}
          required
          disabled={carregando}
          placeholder="Ex.: Treino A"
        />
      </label>

      <label>
        Descrição

        <textarea
          name="descricao"
          defaultValue={item?.descricao ?? ""}
          disabled={carregando}
          placeholder="Ex.: Peito + Ombro + Tríceps"
        />
      </label>

      <section className="lista-tarefas-editor">
        <h3>Exercícios do treino</h3>

        <div className="adicionar-exercicio">
          <label>
            Adicionar exercício

            <select
              value={selecionadoAtual ?? ""}
              onChange={(event) =>
                setSelecionadoAtual(
                  event.target.value
                    ? Number(event.target.value)
                    : null,
                )
              }
              disabled={carregando}
            >
              <option value="">
                Selecione um exercício...
              </option>

              {exercicios.map((exercicio) => (
                <option
                  key={exercicio.id}
                  value={exercicio.id}
                >
                  {exercicio.nome}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="botao primario"
            onClick={adicionarExercicio}
            disabled={selecionadoAtual === null || carregando}
          >
            <Plus size={16} />

            Adicionar
          </button>
        </div>

        {exerciciosAdicionados.length > 0 ? (
          <div className="tarefas-editor">
            {exerciciosAdicionados.map(
              (exercicio, indice) => (
                <div
                  key={`${exercicio.exercicio_id}-${indice}`}
                  className="tarefa-editor"
                >
                  <div className="tarefa-editor-cabecalho">
                    <Circle
                      className="tarefa-editor-icone"
                      size={18}
                    />

                    <span className="tarefa-editor-nome">
                      {exercicio.nome}
                    </span>

                    <button
                      type="button"
                      className="icone perigo"
                      onClick={() =>
                        removerExercicio(indice)
                      }
                      disabled={carregando}
                      aria-label={`Remover ${exercicio.nome}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="campos-duplos tarefa-editor-campos">
                    <label>
                      Séries

                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={exercicio.series}
                        onChange={(event) =>
                          atualizarExercicio(
                            indice,
                            "series",
                            event.target.value,
                          )
                        }
                        disabled={carregando}
                      />
                    </label>

                    <label>
                      Repetições

                      <input
                        type="text"
                        value={exercicio.repeticoes}
                        onChange={(event) =>
                          atualizarExercicio(
                            indice,
                            "repeticoes",
                            event.target.value,
                          )
                        }
                        placeholder="10 ou 8-10"
                        disabled={carregando}
                      />
                    </label>

                    <label>
                      Carga (kg)

                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={exercicio.carga}
                        onChange={(event) =>
                          atualizarExercicio(
                            indice,
                            "carga",
                            event.target.value,
                          )
                        }
                        disabled={carregando}
                      />
                    </label>

                    <label>
                      Descanso (s)

                      <input
                        type="number"
                        min="0"
                        max="3600"
                        value={exercicio.descanso}
                        onChange={(event) =>
                          atualizarExercicio(
                            indice,
                            "descanso",
                            event.target.value,
                          )
                        }
                        disabled={carregando}
                      />
                    </label>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="muted">
            Nenhum exercício adicionado ainda.
          </p>
        )}
      </section>

      <label className="switch-campo">
        <span>Treino ativo</span>

        <span className="switch">
          <input
            type="checkbox"
            name="ativo"
            value="true"
            defaultChecked={item?.ativo ?? true}
            disabled={carregando}
          />

          <span
            className="switch-slider"
            aria-hidden="true"
          />
        </span>
      </label>

      <button
        type="submit"
        className="botao primario"
        disabled={carregando}
      >
        {carregando
          ? "Salvando..."
          : item
            ? "Salvar alterações"
            : "Criar treino"}
      </button>
    </form>
  );
}

function CardTreino({
  treino,
  abrir,
  carregandoExclusao,
  handleExcluir,
}: {
  treino: Treino;
  abrir: (treino: Treino) => void;
  carregandoExclusao: number | null;
  handleExcluir: (
    id: number,
    formData: FormData,
  ) => Promise<void>;
}) {
  const exerciciosOrdenados = [
    ...treino.exercicios_treino,
  ].sort((a, b) => a.ordem - b.ordem);

  const totalExercicios =
    exerciciosOrdenados.length;

  const [menuAberto, setMenuAberto] = useState(false);
  const [exerciciosVisiveis, setExerciciosVisiveis] =
    useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const listaExerciciosId = `exercicios-${treino.id}`;

  useEffect(() => {
    function fecharAoClicarFora(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuAberto(false);
      }
    }

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuAberto(false);
      }
    }

    document.addEventListener("mousedown", fecharAoClicarFora);
    document.addEventListener("keydown", fecharComEscape);

    return () => {
      document.removeEventListener("mousedown", fecharAoClicarFora);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, []);

  return (
    <article className="cartao cartao-treino">
      <div className="treino-cabecalho">
        <div className="treino-identificacao">
          <span
            className={
              treino.ativo
                ? "status ativo"
                : "status"
            }
          >
            {treino.ativo
              ? "Ativo"
              : "Inativo"}
          </span>

          <h2>{treino.nome}</h2>

          {treino.descricao && (
            <p className="muted treino-descricao">
              {treino.descricao}
            </p>
          )}
        </div>

        <div
          ref={menuRef}
          className="menu-acoes"
        >
          <button
            type="button"
            className="menu-acoes-botao"
            aria-label="Mais opções"
            aria-expanded={menuAberto}
            aria-haspopup="menu"
            onClick={() =>
              setMenuAberto((aberto) => !aberto)
            }
          >
            <EllipsisVertical size={21} />
          </button>

          {menuAberto && (
            <div
              className="menu-acoes-conteudo"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuAberto(false);
                  abrir(treino);
                }}
              >
                <Pencil size={16} />
                Editar
              </button>

              <form
                action={(formData) =>
                  handleExcluir(
                    treino.id,
                    formData,
                  )
                }
                onSubmit={(event) => {
                  if (
                    carregandoExclusao ===
                      treino.id ||
                    !window.confirm(
                      `Deseja excluir o treino "${treino.nome}"?`,
                    )
                  ) {
                    event.preventDefault();
                    return;
                  }

                  setMenuAberto(false);
                }}
              >
                <input
                  type="hidden"
                  name="id"
                  value={treino.id}
                />

                <button
                  type="submit"
                  role="menuitem"
                  className="acao-excluir"
                  disabled={
                    carregandoExclusao ===
                    treino.id
                  }
                >
                  <Trash2 size={16} />

                  {carregandoExclusao ===
                  treino.id
                    ? "Excluindo..."
                    : "Excluir"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {exerciciosVisiveis && totalExercicios > 0 ? (
        <ul
          id={listaExerciciosId}
          className="lista-exercicios lista-treino"
        >
          {exerciciosOrdenados.map(
            (exercicio, indice) => (
              <li key={exercicio.id}>
                <span className="todo-numero">
                  {indice + 1}
                </span>

                <span className="todo-conteudo">
                  <span className="nome-exercicio">
                    {exercicio.exercicios
                      ?.nome ??
                      "Exercício desconhecido"}
                  </span>

                  <span className="todo-detalhe">
                    {exercicio.exercicios
                      ?.grupo_muscular ??
                      "OUTROS"}
                    {" · "}
                    {
                      exercicio.series_planejadas
                    }{" "}
                    séries
                    {" · "}
                    {
                      exercicio.repeticoes_planejadas
                    }{" "}
                    repetições
                    {" · "}
                    {
                      exercicio.descanso_segundos
                    }
                    s descanso
                  </span>
                </span>

                <span className="repeticoes">
                  {exercicio.carga_sugerida ??
                    0}{" "}
                  kg
                </span>
              </li>
            ),
          )}
        </ul>
      ) : totalExercicios === 0 ? (
        <p className="muted">
          Sem exercícios cadastrados.
        </p>
      ) : null}

      <div className="treino-rodape">
        {totalExercicios > 0 && (
          <button
            type="button"
            className="botao-exercicios"
            aria-expanded={exerciciosVisiveis}
            aria-controls={listaExerciciosId}
            onClick={() =>
              setExerciciosVisiveis(
                (visivel) => !visivel,
              )
            }
          >
            <ChevronDown
              size={18}
              className={
                exerciciosVisiveis
                  ? "botao-exercicios-icone aberto"
                  : "botao-exercicios-icone"
              }
            />
            {exerciciosVisiveis
              ? "Ocultar exercícios"
              : `Ver exercícios (${totalExercicios})`}
          </button>
        )}

        {treino.ativo &&
          totalExercicios > 0 && (
            <form action={iniciarTreino}>
              <input
                type="hidden"
                name="id"
                value={treino.id}
              />

              <input
                type="hidden"
                name="nome"
                value={treino.nome}
              />

              <BotaoSubmit
                className="botao primario iniciar-treino"
                pendente="Iniciando..."
              >
                <Play size={17} />
                Iniciar treino
              </BotaoSubmit>
            </form>
          )}
      </div>
    </article>
  );
}

export function GerenciadorTreinos({
  itens,
  exercicios,
}: {
  itens: Treino[];
  exercicios: Exercicio[];
}) {
  const router = useRouter();

  const [aberto, setAberto] = useState<
    Treino | null | undefined
  >();

  const [
    carregandoExclusao,
    setCarregandoExclusao,
  ] = useState<number | null>(null);

  const dialog =
    useRef<HTMLDialogElement>(null);

  const abrir = (
    treino: Treino | null,
  ) => {
    setAberto(treino);

    dialog.current?.showModal();
  };

  const fechar = () => {
    dialog.current?.close();

    setAberto(undefined);
  };

  const handleExcluir = async (
    id: number,
    formData: FormData,
  ) => {
    if (carregandoExclusao) {
      return;
    }

    try {
      setCarregandoExclusao(id);

      await excluirTreino(formData);

      router.refresh();
    } catch (erro) {
      console.error(
        "Erro ao excluir treino:",
        erro,
      );
    } finally {
      setCarregandoExclusao(null);
    }
  };

  return (
    <>
      <button
        type="button"
        className="botao primario"
        onClick={() => abrir(null)}
      >
        <Plus size={18} />
        Novo treino
      </button>

      <div className="lista-cards lista-treinos">
        {itens.map((treino) => (
          <CardTreino
            key={treino.id}
            treino={treino}
            abrir={abrir}
            carregandoExclusao={
              carregandoExclusao
            }
            handleExcluir={handleExcluir}
          />
        ))}

        {itens.length === 0 && (
          <div className="cartao vazio">
            <span>🏋️</span>

            <h2>
              Monte sua primeira ficha
            </h2>

            <p>
              Cadastre antes um exercício
              e depois crie seu treino.
            </p>
          </div>
        )}
      </div>

      <Modal
        dialogRef={dialog}
        aberto={aberto !== undefined}
        titulo={aberto ? "Editar treino" : "Novo treino"}
        fechar={fechar}
      >
        {aberto !== undefined && (
          <FormularioTreino
            item={aberto ?? undefined}
            exercicios={exercicios}
            fechar={fechar}
          />
        )}
      </Modal>
    </>
  );
}
