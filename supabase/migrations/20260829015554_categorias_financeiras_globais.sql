-- Categorias financeiras viram um catalogo global do sistema, compartilhado por todos os clientes.

alter table public.despesas drop constraint if exists despesa_categoria_propria;
alter table public.despesas_recorrentes drop constraint if exists recorrencia_categoria_propria;
alter table public.categorias_financeiras drop constraint if exists categorias_id_usuario_unico;
alter table public.categorias_financeiras drop constraint if exists categorias_financeiras_usuario_id_nome_key;
alter table public.categorias_financeiras drop constraint if exists categorias_financeiras_usuario_id_fkey;

drop policy if exists "proprietario seleciona categorias_financeiras" on public.categorias_financeiras;
drop policy if exists "proprietario insere categorias_financeiras" on public.categorias_financeiras;
drop policy if exists "proprietario atualiza categorias_financeiras" on public.categorias_financeiras;
drop policy if exists "proprietario exclui categorias_financeiras" on public.categorias_financeiras;

with categorias_canonicas as (
  select nome, min(id) as id_canonico
  from public.categorias_financeiras
  group by nome
),
despesas_remapeadas as (
  select despesas.id as despesa_id, categorias_canonicas.id_canonico
  from public.despesas
  join public.categorias_financeiras as categorias on categorias.id = despesas.categoria_id
  join categorias_canonicas on categorias_canonicas.nome = categorias.nome
)
update public.despesas as despesas
set categoria_id = despesas_remapeadas.id_canonico
from despesas_remapeadas
where despesas.id = despesas_remapeadas.despesa_id;

with categorias_canonicas as (
  select nome, min(id) as id_canonico
  from public.categorias_financeiras
  group by nome
),
recorrencias_remapeadas as (
  select recorrencias.id as recorrencia_id, categorias_canonicas.id_canonico
  from public.despesas_recorrentes as recorrencias
  join public.categorias_financeiras as categorias on categorias.id = recorrencias.categoria_id
  join categorias_canonicas on categorias_canonicas.nome = categorias.nome
)
update public.despesas_recorrentes as recorrencias
set categoria_id = recorrencias_remapeadas.id_canonico
from recorrencias_remapeadas
where recorrencias.id = recorrencias_remapeadas.recorrencia_id;

delete from public.categorias_financeiras as categorias
using public.categorias_financeiras as canonicas
where categorias.nome = canonicas.nome
  and categorias.id > canonicas.id;

alter table public.categorias_financeiras drop column usuario_id;
alter table public.categorias_financeiras add constraint categorias_financeiras_nome_key unique (nome);

alter table public.despesas add constraint despesas_categoria_id_fkey foreign key (categoria_id) references public.categorias_financeiras(id) on delete restrict;
alter table public.despesas_recorrentes add constraint despesas_recorrentes_categoria_id_fkey foreign key (categoria_id) references public.categorias_financeiras(id) on delete restrict;

create policy "autenticados leem categorias_financeiras" on public.categorias_financeiras
  for select to authenticated
  using (true);

revoke insert, update, delete on public.categorias_financeiras from authenticated;

insert into public.categorias_financeiras (nome, padrao, ativa)
values
  ('Academia', true, true),
  ('Alimentação', true, true),
  ('Transporte', true, true),
  ('Moradia', true, true),
  ('Assinaturas', true, true),
  ('Saúde', true, true),
  ('Lazer', true, true),
  ('Compras', true, true),
  ('Outros', true, true)
on conflict (nome) do update
set padrao = excluded.padrao,
    ativa = excluded.ativa;

create or replace function private.inicializar_usuario_movz()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (usuario_id, nome)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1)))
  on conflict (usuario_id) do nothing;

  return new;
end;
$$;
