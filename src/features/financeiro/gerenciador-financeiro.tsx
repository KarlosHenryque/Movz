"use client";
import { useMemo, useRef, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { excluirDespesa, salvarDespesa } from "./acoes";
type Categoria = { id: string; nome: string };
type Despesa = {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  tipo: "FIXA" | "VARIAVEL";
  observacao: string | null;
  categoria_id: string;
  categorias_financeiras: { nome: string } | null;
};
const dinheiro = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
function Formulario({
  item,
  categorias,
  fechar,
}: {
  item?: Despesa;
  categorias: Categoria[];
  fechar: () => void;
}) {
  return (
    <form
      action={async (f) => {
        await salvarDespesa(f);
        fechar();
      }}
      className="formulario"
    >
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <label>
        Descrição
        <input
          name="descricao"
          defaultValue={item?.descricao}
          required
          minLength={2}
        />
      </label>
      <div className="campos-duplos">
        <label>
          Valor
          <input
            name="valor"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={item?.valor}
            required
          />
        </label>
        <label>
          Data
          <input
            name="data"
            type="date"
            defaultValue={item?.data ?? new Date().toISOString().slice(0, 10)}
            required
          />
        </label>
      </div>
      <label>
        Categoria
        <select name="categoria_id" defaultValue={item?.categoria_id}>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tipo
        <select name="tipo" defaultValue={item?.tipo ?? "VARIAVEL"}>
          <option value="VARIAVEL">Variável</option>
          <option value="FIXA">Fixa</option>
        </select>
      </label>
      <label>
        Observação
        <textarea name="observacao" defaultValue={item?.observacao ?? ""} />
      </label>
      <button className="botao primario">Salvar despesa</button>
    </form>
  );
}
export function GerenciadorFinanceiro({
  itens,
  categorias,
}: {
  itens: Despesa[];
  categorias: Categoria[];
}) {
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<Despesa | null | undefined>();
  const dialog = useRef<HTMLDialogElement>(null);
  const filtrados = useMemo(
    () =>
      itens.filter((i) =>
        i.descricao.toLowerCase().includes(busca.toLowerCase()),
      ),
    [itens, busca],
  );
  const total = itens.reduce((s, i) => s + Number(i.valor), 0),
    fixo = itens
      .filter((i) => i.tipo === "FIXA")
      .reduce((s, i) => s + Number(i.valor), 0);
  const abrir = (i: Despesa | null) => {
    setAberto(i);
    dialog.current?.showModal();
  };
  const fechar = () => {
    dialog.current?.close();
    setAberto(undefined);
  };
  return (
    <>
      <button
        className="botao primario"
        onClick={() => abrir(null)}
        disabled={!categorias.length}
      >
        <Plus size={18} />
        {categorias.length ? "Nova despesa" : "Categorias indisponíveis"}
      </button>
      <div className="grade">
        <div className="cartao destaque">
          <p>Total no período</p>
          <strong className="valor grande">{dinheiro(total)}</strong>
        </div>
        <div className="metricas">
          <div className="cartao">
            <span>Fixos</span>
            <strong>{dinheiro(fixo)}</strong>
          </div>
          <div className="cartao">
            <span>Variáveis</span>
            <strong>{dinheiro(total - fixo)}</strong>
          </div>
        </div>
      </div>
      <div className="barra-busca espacada">
        <Search size={18} />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar despesas..."
          aria-label="Buscar despesas"
        />
      </div>
      <div className="lista-cards">
        {filtrados.map((i) => (
          <article className="cartao linha-lista" key={i.id}>
            <div>
              <span className="selo neutro">
                {i.categorias_financeiras?.nome ?? i.tipo}
              </span>
              <h2>{i.descricao}</h2>
              <p className="muted">
                {new Date(`${i.data}T12:00:00`).toLocaleDateString("pt-BR")} ·{" "}
                {i.tipo === "FIXA" ? "Fixa" : "Variável"}
              </p>
            </div>
            <strong>{dinheiro(Number(i.valor))}</strong>
            <div className="acoes-item">
              <button
                className="icone"
                onClick={() => abrir(i)}
                aria-label={`Editar ${i.descricao}`}
              >
                <Pencil size={16} />
              </button>
              <form
                action={excluirDespesa}
                onSubmit={(e) => {
                  if (!confirm(`Excluir ${i.descricao}?`)) e.preventDefault();
                }}
              >
                <input type="hidden" name="id" value={i.id} />
                <button
                  className="icone perigo"
                  aria-label={`Excluir ${i.descricao}`}
                >
                  <Trash2 size={16} />
                </button>
              </form>
            </div>
          </article>
        ))}
        {!filtrados.length && (
          <div className="cartao vazio">
            <span>◒</span>
            <h2>Nenhuma despesa</h2>
            <p>
              {busca
                ? "Tente outro termo."
                : "Cadastre uma despesa para acompanhar seus gastos."}
            </p>
          </div>
        )}
      </div>
      <dialog ref={dialog} className="modal">
        <div className="linha">
          <h2>{aberto ? "Editar despesa" : "Nova despesa"}</h2>
          <button className="icone" onClick={fechar} aria-label="Fechar">
            <X />
          </button>
        </div>
        {aberto !== undefined && (
          <Formulario
            item={aberto ?? undefined}
            categorias={categorias}
            fechar={fechar}
          />
        )}
      </dialog>
    </>
  );
}
