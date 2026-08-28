-- Mantem os IDs UUID existentes, mas reforca que referencias opcionais
-- continuem pertencendo ao mesmo usuario do registro filho.
--
-- NOT VALID evita quebrar ambientes com dados historicos inconsistentes.
-- A constraint ainda e aplicada para novos inserts/updates.

alter table public.execucoes_treino
  add constraint execucao_treino_proprio
  foreign key (treino_id, usuario_id)
  references public.treinos(id, usuario_id)
  on delete set null (treino_id)
  not valid;

alter table public.series_executadas
  add constraint serie_exercicio_proprio
  foreign key (exercicio_id, usuario_id)
  references public.exercicios(id, usuario_id)
  on delete set null (exercicio_id)
  not valid;
