-- Mantem auth.users/perfis em UUID e converte os IDs das tabelas do app para bigint sequencial.

drop index if exists public.exercicios_treino_treino_idx;
drop index if exists public.series_exercicio_data_idx;
drop index if exists public.despesas_categoria_data_idx;
drop index if exists public.recorrencias_ativas_idx;
drop index if exists public.series_execucao_ordem_idx;
drop index if exists public.planos_usuario_treino_ordem_idx;

alter table public.despesas drop constraint if exists despesa_recorrencia_propria;
alter table public.despesas drop constraint if exists despesa_categoria_propria;
alter table public.despesas drop constraint if exists despesas_recorrencia_id_fkey;
alter table public.despesas drop constraint if exists despesas_categoria_id_fkey;
alter table public.despesas drop constraint if exists despesas_recorrencia_id_data_key;
alter table public.despesas drop constraint if exists despesas_pkey;
alter table public.despesas_recorrentes drop constraint if exists recorrencia_categoria_propria;
alter table public.despesas_recorrentes drop constraint if exists despesas_recorrentes_categoria_id_fkey;
alter table public.despesas_recorrentes drop constraint if exists recorrencias_id_usuario_unico;
alter table public.despesas_recorrentes drop constraint if exists despesas_recorrentes_pkey;
alter table public.categorias_financeiras drop constraint if exists categorias_id_usuario_unico;
alter table public.categorias_financeiras drop constraint if exists categorias_financeiras_pkey;
alter table public.series_executadas drop constraint if exists serie_execucao_propria;
alter table public.series_executadas drop constraint if exists series_executadas_execucao_id_fkey;
alter table public.series_executadas drop constraint if exists series_executadas_exercicio_id_fkey;
alter table public.series_executadas drop constraint if exists series_executadas_execucao_id_ordem_exercicio_numero_serie_key;
alter table public.series_executadas drop constraint if exists series_executadas_pkey;
alter table public.execucoes_treino drop constraint if exists execucoes_id_usuario_unico;
alter table public.execucoes_treino drop constraint if exists execucoes_treino_treino_id_fkey;
alter table public.execucoes_treino drop constraint if exists execucoes_treino_pkey;
alter table public.exercicios_treino drop constraint if exists exercicio_treino_exercicio_proprio;
alter table public.exercicios_treino drop constraint if exists exercicio_treino_treino_proprio;
alter table public.exercicios_treino drop constraint if exists exercicios_treino_exercicio_id_fkey;
alter table public.exercicios_treino drop constraint if exists exercicios_treino_treino_id_fkey;
alter table public.exercicios_treino drop constraint if exists exercicios_treino_treino_id_ordem_key;
alter table public.exercicios_treino drop constraint if exists exercicios_treino_pkey;
alter table public.treinos drop constraint if exists treinos_id_usuario_unico;
alter table public.treinos drop constraint if exists treinos_pkey;
alter table public.exercicios drop constraint if exists exercicios_id_usuario_unico;
alter table public.exercicios drop constraint if exists exercicios_pkey;

alter table public.exercicios add column id_novo bigint;
alter table public.treinos add column id_novo bigint;
alter table public.exercicios_treino add column id_novo bigint, add column treino_id_novo bigint, add column exercicio_id_novo bigint;
alter table public.execucoes_treino add column id_novo bigint, add column treino_id_novo bigint;
alter table public.series_executadas add column id_novo bigint, add column execucao_id_novo bigint, add column exercicio_id_novo bigint;
alter table public.categorias_financeiras add column id_novo bigint;
alter table public.despesas_recorrentes add column id_novo bigint, add column categoria_id_novo bigint;
alter table public.despesas add column id_novo bigint, add column categoria_id_novo bigint, add column recorrencia_id_novo bigint;

with numerados as (select id, row_number() over (order by criado_em, id) as novo from public.exercicios) update public.exercicios as destino set id_novo = numerados.novo from numerados where destino.id = numerados.id;
with numerados as (select id, row_number() over (order by criado_em, id) as novo from public.treinos) update public.treinos as destino set id_novo = numerados.novo from numerados where destino.id = numerados.id;
with numerados as (select id, row_number() over (order by treino_id, ordem, id) as novo from public.exercicios_treino) update public.exercicios_treino as destino set id_novo = numerados.novo from numerados where destino.id = numerados.id;
with numerados as (select id, row_number() over (order by iniciada_em, id) as novo from public.execucoes_treino) update public.execucoes_treino as destino set id_novo = numerados.novo from numerados where destino.id = numerados.id;
with numerados as (select id, row_number() over (order by concluida_em, id) as novo from public.series_executadas) update public.series_executadas as destino set id_novo = numerados.novo from numerados where destino.id = numerados.id;
with numerados as (select id, row_number() over (order by criado_em, usuario_id, nome, id) as novo from public.categorias_financeiras) update public.categorias_financeiras as destino set id_novo = numerados.novo from numerados where destino.id = numerados.id;
with numerados as (select id, row_number() over (order by criado_em, id) as novo from public.despesas_recorrentes) update public.despesas_recorrentes as destino set id_novo = numerados.novo from numerados where destino.id = numerados.id;
with numerados as (select id, row_number() over (order by data, criado_em, id) as novo from public.despesas) update public.despesas as destino set id_novo = numerados.novo from numerados where destino.id = numerados.id;

update public.exercicios_treino as destino set treino_id_novo = treinos.id_novo from public.treinos where destino.treino_id = treinos.id;
update public.exercicios_treino as destino set exercicio_id_novo = exercicios.id_novo from public.exercicios where destino.exercicio_id = exercicios.id;
update public.execucoes_treino as destino set treino_id_novo = treinos.id_novo from public.treinos where destino.treino_id = treinos.id;
update public.series_executadas as destino set execucao_id_novo = execucoes.id_novo from public.execucoes_treino as execucoes where destino.execucao_id = execucoes.id;
update public.series_executadas as destino set exercicio_id_novo = exercicios.id_novo from public.exercicios where destino.exercicio_id = exercicios.id;
update public.despesas_recorrentes as destino set categoria_id_novo = categorias.id_novo from public.categorias_financeiras as categorias where destino.categoria_id = categorias.id;
update public.despesas as destino set categoria_id_novo = categorias.id_novo from public.categorias_financeiras as categorias where destino.categoria_id = categorias.id;
update public.despesas as destino set recorrencia_id_novo = recorrencias.id_novo from public.despesas_recorrentes as recorrencias where destino.recorrencia_id = recorrencias.id;

alter table public.exercicios alter column id_novo set not null;
alter table public.treinos alter column id_novo set not null;
alter table public.exercicios_treino alter column id_novo set not null, alter column treino_id_novo set not null, alter column exercicio_id_novo set not null;
alter table public.execucoes_treino alter column id_novo set not null;
alter table public.series_executadas alter column id_novo set not null, alter column execucao_id_novo set not null;
alter table public.categorias_financeiras alter column id_novo set not null;
alter table public.despesas_recorrentes alter column id_novo set not null, alter column categoria_id_novo set not null;
alter table public.despesas alter column id_novo set not null, alter column categoria_id_novo set not null;

alter table public.exercicios drop column id;
alter table public.treinos drop column id;
alter table public.exercicios_treino drop column id, drop column treino_id, drop column exercicio_id;
alter table public.execucoes_treino drop column id, drop column treino_id;
alter table public.series_executadas drop column id, drop column execucao_id, drop column exercicio_id;
alter table public.categorias_financeiras drop column id;
alter table public.despesas_recorrentes drop column id, drop column categoria_id;
alter table public.despesas drop column id, drop column categoria_id, drop column recorrencia_id;

alter table public.exercicios rename column id_novo to id;
alter table public.treinos rename column id_novo to id;
alter table public.exercicios_treino rename column id_novo to id;
alter table public.exercicios_treino rename column treino_id_novo to treino_id;
alter table public.exercicios_treino rename column exercicio_id_novo to exercicio_id;
alter table public.execucoes_treino rename column id_novo to id;
alter table public.execucoes_treino rename column treino_id_novo to treino_id;
alter table public.series_executadas rename column id_novo to id;
alter table public.series_executadas rename column execucao_id_novo to execucao_id;
alter table public.series_executadas rename column exercicio_id_novo to exercicio_id;
alter table public.categorias_financeiras rename column id_novo to id;
alter table public.despesas_recorrentes rename column id_novo to id;
alter table public.despesas_recorrentes rename column categoria_id_novo to categoria_id;
alter table public.despesas rename column id_novo to id;
alter table public.despesas rename column categoria_id_novo to categoria_id;
alter table public.despesas rename column recorrencia_id_novo to recorrencia_id;

create sequence public.exercicios_id_seq owned by public.exercicios.id;
create sequence public.treinos_id_seq owned by public.treinos.id;
create sequence public.exercicios_treino_id_seq owned by public.exercicios_treino.id;
create sequence public.execucoes_treino_id_seq owned by public.execucoes_treino.id;
create sequence public.series_executadas_id_seq owned by public.series_executadas.id;
create sequence public.categorias_financeiras_id_seq owned by public.categorias_financeiras.id;
create sequence public.despesas_recorrentes_id_seq owned by public.despesas_recorrentes.id;
create sequence public.despesas_id_seq owned by public.despesas.id;

select setval('public.exercicios_id_seq', coalesce((select max(id) from public.exercicios), 0) + 1, false);
select setval('public.treinos_id_seq', coalesce((select max(id) from public.treinos), 0) + 1, false);
select setval('public.exercicios_treino_id_seq', coalesce((select max(id) from public.exercicios_treino), 0) + 1, false);
select setval('public.execucoes_treino_id_seq', coalesce((select max(id) from public.execucoes_treino), 0) + 1, false);
select setval('public.series_executadas_id_seq', coalesce((select max(id) from public.series_executadas), 0) + 1, false);
select setval('public.categorias_financeiras_id_seq', coalesce((select max(id) from public.categorias_financeiras), 0) + 1, false);
select setval('public.despesas_recorrentes_id_seq', coalesce((select max(id) from public.despesas_recorrentes), 0) + 1, false);
select setval('public.despesas_id_seq', coalesce((select max(id) from public.despesas), 0) + 1, false);

alter table public.exercicios alter column id set default nextval('public.exercicios_id_seq');
alter table public.treinos alter column id set default nextval('public.treinos_id_seq');
alter table public.exercicios_treino alter column id set default nextval('public.exercicios_treino_id_seq');
alter table public.execucoes_treino alter column id set default nextval('public.execucoes_treino_id_seq');
alter table public.series_executadas alter column id set default nextval('public.series_executadas_id_seq');
alter table public.categorias_financeiras alter column id set default nextval('public.categorias_financeiras_id_seq');
alter table public.despesas_recorrentes alter column id set default nextval('public.despesas_recorrentes_id_seq');
alter table public.despesas alter column id set default nextval('public.despesas_id_seq');

alter table public.exercicios add constraint exercicios_pkey primary key (id);
alter table public.treinos add constraint treinos_pkey primary key (id);
alter table public.exercicios_treino add constraint exercicios_treino_pkey primary key (id);
alter table public.execucoes_treino add constraint execucoes_treino_pkey primary key (id);
alter table public.series_executadas add constraint series_executadas_pkey primary key (id);
alter table public.categorias_financeiras add constraint categorias_financeiras_pkey primary key (id);
alter table public.despesas_recorrentes add constraint despesas_recorrentes_pkey primary key (id);
alter table public.despesas add constraint despesas_pkey primary key (id);

alter table public.exercicios add constraint exercicios_id_usuario_unico unique(id, usuario_id);
alter table public.treinos add constraint treinos_id_usuario_unico unique(id, usuario_id);
alter table public.execucoes_treino add constraint execucoes_id_usuario_unico unique(id, usuario_id);
alter table public.categorias_financeiras add constraint categorias_id_usuario_unico unique(id, usuario_id);
alter table public.despesas_recorrentes add constraint recorrencias_id_usuario_unico unique(id, usuario_id);
alter table public.exercicios_treino add constraint exercicios_treino_treino_id_ordem_key unique(treino_id, ordem);
alter table public.series_executadas add constraint series_executadas_execucao_id_ordem_exercicio_numero_serie_key unique(execucao_id, ordem_exercicio, numero_serie);
alter table public.despesas add constraint despesas_recorrencia_id_data_key unique(recorrencia_id, data);

alter table public.exercicios_treino add constraint exercicio_treino_treino_proprio foreign key(treino_id, usuario_id) references public.treinos(id, usuario_id) on delete cascade;
alter table public.exercicios_treino add constraint exercicio_treino_exercicio_proprio foreign key(exercicio_id, usuario_id) references public.exercicios(id, usuario_id) on delete restrict;
alter table public.execucoes_treino add constraint execucoes_treino_treino_id_fkey foreign key(treino_id) references public.treinos(id) on delete set null;
alter table public.series_executadas add constraint serie_execucao_propria foreign key(execucao_id, usuario_id) references public.execucoes_treino(id, usuario_id) on delete cascade;
alter table public.series_executadas add constraint series_executadas_exercicio_id_fkey foreign key(exercicio_id) references public.exercicios(id) on delete set null;
alter table public.despesas_recorrentes add constraint recorrencia_categoria_propria foreign key(categoria_id, usuario_id) references public.categorias_financeiras(id, usuario_id) on delete restrict;
alter table public.despesas add constraint despesa_categoria_propria foreign key(categoria_id, usuario_id) references public.categorias_financeiras(id, usuario_id) on delete restrict;
alter table public.despesas add constraint despesa_recorrencia_propria foreign key(recorrencia_id, usuario_id) references public.despesas_recorrentes(id, usuario_id) on delete set null (recorrencia_id);

create index exercicios_treino_treino_idx on public.exercicios_treino(treino_id, ordem);
create index series_exercicio_data_idx on public.series_executadas(usuario_id, exercicio_id, concluida_em desc);
create index despesas_categoria_data_idx on public.despesas(usuario_id, categoria_id, data desc);
create index recorrencias_ativas_idx on public.despesas_recorrentes(usuario_id, inicio) where ativo;
create index series_execucao_ordem_idx on public.series_executadas (usuario_id, execucao_id, ordem_exercicio, numero_serie);
create index planos_usuario_treino_ordem_idx on public.exercicios_treino (usuario_id, treino_id, ordem);

grant usage, select on all sequences in schema public to authenticated;
