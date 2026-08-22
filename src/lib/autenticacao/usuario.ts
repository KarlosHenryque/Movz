import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
export async function exigirUsuario() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  return { supabase, user };
}
