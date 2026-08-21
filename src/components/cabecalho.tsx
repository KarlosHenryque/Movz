import { Bell } from "lucide-react";
export function Cabecalho({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) { return <header className="cabecalho"><div><p className="eyebrow">MOVZ</p><h1>{titulo}</h1>{subtitulo && <p className="muted">{subtitulo}</p>}</div><button className="icone" aria-label="Notificações"><Bell size={20}/></button></header>; }
