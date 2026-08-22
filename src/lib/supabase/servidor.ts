import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { obterConfiguracaoSupabase } from "./configuracao";

export async function criarClienteServidor() {
  const armazenamento = await cookies();
  const { url, chave } = obterConfiguracaoSupabase();
  return createServerClient(url, chave, {
    cookies: {
      getAll: () => armazenamento.getAll(),
      setAll: (itens) => {
        try {
          itens.forEach(({ name, value, options }) =>
            armazenamento.set(name, value, options),
          );
        } catch {
          /* Server Components não podem gravar cookies. */
        }
      },
    },
  });
}
