import Link from "next/link";
import { History } from "lucide-react";
export function Cabecalho({
  titulo,
  subtitulo,
}: {
  titulo: string;
  subtitulo?: string;
}) {
  return (
    <header className="cabecalho">
      <div>
        <p className="eyebrow">MOVZ</p>
        <h1>{titulo}</h1>
        {subtitulo && <p className="muted">{subtitulo}</p>}
      </div>
      <Link className="icone" href="/historico" aria-label="Abrir histórico">
        <History size={20} />
      </Link>
    </header>
  );
}
