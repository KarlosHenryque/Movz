"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { BotaoSubmit } from "@/components/botao-submit";
import { Modal } from "@/components/modal";
import { excluirDespesa, salvarDespesa } from "./acoes";

type Categoria = { id: number; nome: string };
type Despesa = { id: number; descricao: string; valor: number; data: string; tipo: "FIXA" | "VARIAVEL"; observacao: string | null; categoria_id: number; categorias_financeiras: { nome: string } | null };
const dinheiro = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function FormularioDespesa({ item, categorias, fechar }: { item?: Despesa; categorias: Categoria[]; fechar: () => void }) {
  const router = useRouter();
  const salvar = async (form: FormData) => { await salvarDespesa(form); router.refresh(); fechar(); };
  return <form action={salvar} className="formulario">
    <input type="hidden" name="id" value={item?.id ?? ""} />
    <label>Descrição<input name="descricao" defaultValue={item?.descricao} required minLength={2} /></label>
    <div className="campos-duplos"><label>Valor<input name="valor" type="number" step="0.01" min="0.01" defaultValue={item?.valor} required /></label><label>Data<input name="data" type="date" defaultValue={item?.data ?? new Date().toISOString().slice(0, 10)} required /></label></div>
    <label>Categoria<select name="categoria_id" defaultValue={item?.categoria_id}>{categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}</select></label>
    <label>Tipo<select name="tipo" defaultValue={item?.tipo ?? "VARIAVEL"}><option value="VARIAVEL">Variável</option><option value="FIXA">Fixa</option></select></label>
    <label>Observação<textarea name="observacao" defaultValue={item?.observacao ?? ""} /></label>
    <BotaoSubmit className="botao primario" pendente="Salvando...">Salvar despesa</BotaoSubmit>
  </form>;
}

export function GerenciadorFinanceiro({ itens, categorias }: { itens: Despesa[]; categorias: Categoria[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<Despesa | null | undefined>();
  const dialog = useRef<HTMLDialogElement>(null);
  const filtrados = useMemo(() => itens.filter((item) => item.descricao.toLowerCase().includes(busca.toLowerCase())), [itens, busca]);
  const total = itens.reduce((soma, item) => soma + Number(item.valor), 0);
  const fixo = itens.filter((item) => item.tipo === "FIXA").reduce((soma, item) => soma + Number(item.valor), 0);
  const abrir = (item: Despesa | null) => { setAberto(item); dialog.current?.showModal(); };
  const fechar = () => { dialog.current?.close(); setAberto(undefined); };
  const excluir = async (form: FormData) => { await excluirDespesa(form); router.refresh(); };

  return <>
    <button type="button" className="botao primario" onClick={() => abrir(null)} disabled={!categorias.length}><Plus size={18} />{categorias.length ? "Nova despesa" : "Categorias indisponíveis"}</button>
    <div className="grade"><div className="cartao destaque"><p>Total no período</p><strong className="valor grande">{dinheiro(total)}</strong></div><div className="metricas"><div className="cartao"><span>Fixos</span><strong>{dinheiro(fixo)}</strong></div><div className="cartao"><span>Variáveis</span><strong>{dinheiro(total - fixo)}</strong></div></div></div>
    <div className="barra-busca espacada"><Search size={18} /><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar despesas..." aria-label="Buscar despesas" /></div>
    <div className="lista-cards">{filtrados.map((item) => <article className="cartao linha-lista" key={item.id}><div><span className="selo neutro">{item.categorias_financeiras?.nome ?? item.tipo}</span><h2>{item.descricao}</h2><p className="muted">{new Date(`${item.data}T12:00:00`).toLocaleDateString("pt-BR")} · {item.tipo === "FIXA" ? "Fixa" : "Variável"}</p></div><strong>{dinheiro(Number(item.valor))}</strong><div className="acoes-item"><button type="button" className="icone" onClick={() => abrir(item)} aria-label={`Editar ${item.descricao}`}><Pencil size={16} /></button><form action={excluir} onSubmit={(event) => { if (!confirm(`Excluir ${item.descricao}?`)) event.preventDefault(); }}><input type="hidden" name="id" value={item.id} /><BotaoSubmit className="icone perigo" pendente="..." aria-label={`Excluir ${item.descricao}`}><Trash2 size={16} /></BotaoSubmit></form></div></article>)}
      {!filtrados.length && <div className="cartao vazio"><span>◒</span><h2>Nenhuma despesa</h2><p>{busca ? "Tente outro termo." : "Cadastre uma despesa para acompanhar seus gastos."}</p></div>}
    </div>
    <Modal dialogRef={dialog} aberto={aberto !== undefined} titulo={aberto ? "Editar despesa" : "Nova despesa"} fechar={fechar}>{aberto !== undefined && <FormularioDespesa item={aberto ?? undefined} categorias={categorias} fechar={fechar} />}</Modal>
  </>;
}
