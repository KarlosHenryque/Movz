-- Normaliza o catalogo global para IDs previsiveis de 1 a 9.

alter table public.despesas drop constraint if exists despesas_categoria_id_fkey;
alter table public.despesas_recorrentes drop constraint if exists despesas_recorrentes_categoria_id_fkey;

create temporary table categorias_financeiras_mapa (
  nome text primary key,
  id_atual bigint not null,
  id_novo bigint not null unique
) on commit drop;

insert into categorias_financeiras_mapa (nome, id_atual, id_novo)
select categorias.nome, categorias.id, ordem.id_novo
from (
  values
    ('Academia', 1),
    ('Alimentação', 2),
    ('Transporte', 3),
    ('Moradia', 4),
    ('Assinaturas', 5),
    ('Saúde', 6),
    ('Lazer', 7),
    ('Compras', 8),
    ('Outros', 9)
) as ordem(nome, id_novo)
join public.categorias_financeiras as categorias on categorias.nome = ordem.nome;

update public.despesas as despesas
set categoria_id = mapa.id_novo
from categorias_financeiras_mapa as mapa
where despesas.categoria_id = mapa.id_atual;

update public.despesas_recorrentes as recorrencias
set categoria_id = mapa.id_novo
from categorias_financeiras_mapa as mapa
where recorrencias.categoria_id = mapa.id_atual;

update public.categorias_financeiras as categorias
set id = -mapa.id_novo
from categorias_financeiras_mapa as mapa
where categorias.id = mapa.id_atual;

update public.categorias_financeiras
set id = -id
where id < 0;

select setval('public.categorias_financeiras_id_seq', coalesce((select max(id) from public.categorias_financeiras), 0) + 1, false);

alter table public.despesas add constraint despesas_categoria_id_fkey foreign key (categoria_id) references public.categorias_financeiras(id) on delete restrict;
alter table public.despesas_recorrentes add constraint despesas_recorrentes_categoria_id_fkey foreign key (categoria_id) references public.categorias_financeiras(id) on delete restrict;
