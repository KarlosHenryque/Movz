import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/servidor";
function destinoSeguro(valor: string | null) { return valor?.startsWith("/") && !valor.startsWith("//") ? valor : "/"; }
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url); const tokenHash = searchParams.get("token_hash"); const type = searchParams.get("type") as EmailOtpType | null; const code = searchParams.get("code"); const proximo = destinoSeguro(searchParams.get("next")); const supabase = await criarClienteServidor();
  if (code) { const { error } = await supabase.auth.exchangeCodeForSession(code); if (!error) return NextResponse.redirect(new URL(proximo, request.url)); }
  if (tokenHash && type) { const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }); if (!error) return NextResponse.redirect(new URL(proximo, request.url)); }
  return NextResponse.redirect(new URL("/entrar?erro=Link inválido ou expirado", request.url));
}
