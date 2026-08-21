alter table public.perfis
  add column altura_cm numeric(5,2),
  add column peso_kg numeric(6,2),
  add constraint perfis_altura_valida check (altura_cm is null or altura_cm between 50 and 300),
  add constraint perfis_peso_valido check (peso_kg is null or peso_kg between 20 and 500);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.inicializar_usuario_movz()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  categoria text;
begin
  insert into public.perfis (id, nome)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  foreach categoria in array array['Academia','Alimentação','Transporte','Moradia','Assinaturas','Saúde','Lazer','Compras','Outros']
  loop
    insert into public.categorias_financeiras (usuario_id, nome, padrao)
    values (new.id, categoria, true)
    on conflict (usuario_id, nome) do nothing;
  end loop;
  return new;
end;
$$;

revoke all on function private.inicializar_usuario_movz() from public, anon, authenticated;

create trigger ao_criar_usuario_movz
after insert on auth.users
for each row execute function private.inicializar_usuario_movz();

insert into public.perfis (id, nome)
select id, coalesce(nullif(trim(raw_user_meta_data ->> 'nome'), ''), split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;

insert into public.categorias_financeiras (usuario_id, nome, padrao)
select usuario.id, categoria.nome, true
from auth.users as usuario
cross join (values ('Academia'),('Alimentação'),('Transporte'),('Moradia'),('Assinaturas'),('Saúde'),('Lazer'),('Compras'),('Outros')) as categoria(nome)
on conflict (usuario_id, nome) do nothing;
