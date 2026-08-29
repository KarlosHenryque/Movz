-- Separa o identificador interno sequencial do perfil do UUID usado pelo Supabase Auth.

alter table public.perfis drop constraint if exists perfis_id_fkey;
alter table public.perfis drop constraint if exists perfis_pkey;

alter table public.perfis add column usuario_id uuid;

update public.perfis
set usuario_id = id
where usuario_id is null;

alter table public.perfis alter column usuario_id set not null;

drop policy if exists "proprietario seleciona perfis" on public.perfis;
drop policy if exists "proprietario insere perfis" on public.perfis;
drop policy if exists "proprietario atualiza perfis" on public.perfis;
drop policy if exists "proprietario exclui perfis" on public.perfis;

alter table public.perfis add column id_novo bigint;

with numerados as (
  select usuario_id, row_number() over (order by criado_em, usuario_id) as novo
  from public.perfis
)
update public.perfis as destino
set id_novo = numerados.novo
from numerados
where destino.usuario_id = numerados.usuario_id;

alter table public.perfis alter column id_novo set not null;
alter table public.perfis drop column id;
alter table public.perfis rename column id_novo to id;

create sequence public.perfis_id_seq owned by public.perfis.id;
select setval('public.perfis_id_seq', coalesce((select max(id) from public.perfis), 0) + 1, false);

alter table public.perfis alter column id set default nextval('public.perfis_id_seq');
alter table public.perfis add constraint perfis_pkey primary key (id);
alter table public.perfis add constraint perfis_usuario_id_key unique (usuario_id);
alter table public.perfis add constraint perfis_usuario_id_fkey foreign key (usuario_id) references auth.users(id) on delete cascade;

create policy "proprietario seleciona perfis" on public.perfis
  for select to authenticated
  using ((select auth.uid()) = usuario_id);

create policy "proprietario insere perfis" on public.perfis
  for insert to authenticated
  with check ((select auth.uid()) = usuario_id);

create policy "proprietario atualiza perfis" on public.perfis
  for update to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);

create policy "proprietario exclui perfis" on public.perfis
  for delete to authenticated
  using ((select auth.uid()) = usuario_id);

revoke update (usuario_id) on public.perfis from authenticated;
grant usage, select on sequence public.perfis_id_seq to authenticated;

create or replace function private.inicializar_usuario_movz()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  categoria text;
begin
  insert into public.perfis (usuario_id, nome)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1)))
  on conflict (usuario_id) do nothing;

  foreach categoria in array array['Academia','Alimentação','Transporte','Moradia','Assinaturas','Saúde','Lazer','Compras','Outros']
  loop
    insert into public.categorias_financeiras (usuario_id, nome, padrao)
    values (new.id, categoria, true)
    on conflict (usuario_id, nome) do nothing;
  end loop;

  return new;
end;
$$;

insert into public.perfis (usuario_id, nome)
select id, coalesce(nullif(trim(raw_user_meta_data ->> 'nome'), ''), split_part(email, '@', 1))
from auth.users
on conflict (usuario_id) do nothing;
