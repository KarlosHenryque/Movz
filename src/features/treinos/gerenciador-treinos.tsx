"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Plus, Pencil, Trash2, X } from "lucide-react";
import { excluirTreino, iniciarTreino, salvarTreino } from "./acoes";
type Exercicio = { id: string; nome: string };
type ExercicioTreino = {
  exercicio_id: string;
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
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  exercicios_treino: ExercicioTreino[];
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
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const plano = item?.exercicios_treino[0];
  
  return (
    <form
      action={async (f) => {
        try {
          setCarregando(true);
          await salvarTreino(f);
          router.refresh();
          fechar();
        } catch (err) {
          setCarregando(false);
          throw err;
        }
      }}
      className="formulario"
    >
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <label>
        Nome
        <input name="nome" defaultValue={item?.nome} required disabled={carregando} />
      </label>
      <label>
        Descrição
        <textarea name="descricao" defaultValue={item?.descricao ?? ""} disabled={carregando} />
      </label>
      <label>
        Exercício
        <select name="exercicio_id" defaultValue={plano?.exercicio_id} disabled={carregando}>
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
            disabled={carregando}
          />
        </label>
        <label>
          Repetições
          <input
            name="repeticoes"
            defaultValue={plano?.repeticoes_planejadas ?? "10"}
            disabled={carregando}
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
            disabled={carregando}
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
            disabled={carregando}
          />
        </label>
      </div>
      <label className="switch">
        <input
          type="checkbox"
          name="ativo"
          value="true"
          defaultChecked={item?.ativo ?? true}
          disabled={carregando}
        />
        <span>Ativo</span>
        <span className="switch-slider" aria-hidden="true" />
      </label>
      <button className="botao primario" disabled={carregando}>
        {carregando ? "Salvando..." : "Salvar treino"}
      </button>
    </form>
  );
}

function agruparPorGrupoMuscular(exercicios: ExercicioTreino[]) {
  const grupos: Record<string, ExercicioTreino[]> = {};
  exercicios.forEach((ex) => {
    const grupo = ex.exercicios?.grupo_muscular ?? "OUTROS";
    if (!grupos[grupo]) grupos[grupo] = [];
    grupos[grupo].push(ex);
  });
  return Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b));
}

function CardTreino({ treino }: { treino: Treino }) {
  const gruposExercicios = agruparPorGrupoMuscular(treino.exercicios_treino);
  const totalExercicios = treino.exercicios_treino.length;

  return (
    <article className="cartao cartao-treino">
      <div className="linha">
        <div>
          <span className={treino.ativo ? "status ativo" : "status"}>
            {treino.ativo ? "Ativo" : "Inativo"}
          </span>
          <h2>{treino.nome}</h2>
        </div>
      </div>
      {treino.descricao && <p className="muted">{treino.descricao}</p>}

      {totalExercicios > 0 ? (
        <div className="grupos-exercicios">
          {gruposExercicios.map(([grupo, exercicios]) => (
            <div key={grupo} className="grupo-muscular">
              <h3 className="grupo-titulo">{grupo}</h3>
              <ul className="lista-exercicios">
                {exercicios.map((ex) => (
                  <li key={ex.exercicio_id}>
                    <span className="nome-exercicio">
                      {ex.exercicios?.nome ?? "Exercício desconhecido"}
                    </span>
                    <span className="repeticoes">
                      {ex.series_planejadas}×{ex.repeticoes_planejadas}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">Sem exercícios cadastrados</p>
      )}
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
  const [aberto, setAberto] = useState<Treino | null | undefined>();
  const [carregandoExclusao, setCarregandoExclusao] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  
  const abrir = (i: Treino | null) => {
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
      await excluirTreino(formData);
      router.refresh();
    } catch (err) {
      setCarregandoExclusao(null);
      throw err;
    }
  };
  
  return (
    <>
      <button className="botao primario" onClick={() => abrir(null)}>
        <Plus size={18} />
        Novo treino
      </button>
      <div className="grade lista-cards">
        {itens.map((i) => (
          <div key={i.id} className="treino-container">
            <CardTreino treino={i} />
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
                action={(f) => handleExcluir(i.id, f)}
                onSubmit={(e) => {
                  if (carregandoExclusao === i.id || !confirm(`Excluir ${i.nome}?`)) {
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
          </div>
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
