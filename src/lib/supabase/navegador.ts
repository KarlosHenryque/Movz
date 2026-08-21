"use client";
import { createBrowserClient } from "@supabase/ssr";
import { obterConfiguracaoSupabase } from "./configuracao";
export function criarClienteNavegador() {
  const { url, chave } = obterConfiguracaoSupabase();
  return createBrowserClient(url, chave);
}
