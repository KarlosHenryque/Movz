-- Impede que o dono de um registro seja reatribuído por clientes autenticados.
revoke update (usuario_id) on public.exercicios from authenticated;
revoke update (usuario_id) on public.treinos from authenticated;
revoke update (usuario_id) on public.exercicios_treino from authenticated;
revoke update (usuario_id) on public.execucoes_treino from authenticated;
revoke update (usuario_id) on public.series_executadas from authenticated;
revoke update (usuario_id) on public.categorias_financeiras from authenticated;
revoke update (usuario_id) on public.despesas_recorrentes from authenticated;
revoke update (usuario_id) on public.despesas from authenticated;

create index if not exists series_execucao_ordem_idx
  on public.series_executadas (usuario_id, execucao_id, ordem_exercicio, numero_serie);

create index if not exists planos_usuario_treino_ordem_idx
  on public.exercicios_treino (usuario_id, treino_id, ordem);
