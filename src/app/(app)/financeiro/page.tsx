import { Cabecalho } from "@/components/cabecalho";
import { GerenciadorFinanceiro } from "@/features/financeiro/gerenciador-financeiro";
import { exigirUsuario } from "@/lib/autenticacao/usuario";
export default async function Page() {
  const { supabase, user } = await exigirUsuario();
  const inicio = new Date();
  inicio.setDate(1);
  const fim = new Date(inicio);
  fim.setMonth(fim.getMonth() + 1);
  const [{ data: categorias }, { data: despesas }] = await Promise.all([
    supabase
      .from("categorias_financeiras")
      .select("id,nome")
      .eq("ativa", true)
      .order("nome"),
    supabase
      .from("despesas")
      .select("id,descricao,valor,data,tipo,observacao,categoria_id")
      .eq("usuario_id", user.id)
      .gte("data", inicio.toISOString().slice(0, 10))
      .lt("data", fim.toISOString().slice(0, 10))
      .order("data", { ascending: false }),
  ]);
  const itens = (despesas ?? []).map((d) => ({
    ...d,
    categorias_financeiras: {
      nome:
        categorias?.find((c) => c.id === d.categoria_id)?.nome ??
        "Sem categoria",
    },
  }));
  return (
    <>
      <Cabecalho
        titulo="Financeiro"
        subtitulo={inicio.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })}
      />
      <GerenciadorFinanceiro
        categorias={categorias ?? []}
        itens={itens as never}
      />
    </>
  );
}
