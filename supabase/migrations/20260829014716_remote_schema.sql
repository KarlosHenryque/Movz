drop extension if exists "pg_net";

alter table "public"."categorias_financeiras" drop column "cor";

alter table "public"."exercicios" drop column if exists "descricao";
alter table "public"."exercicios" drop column if exists "observacoes";


