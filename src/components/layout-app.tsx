import { Navegacao } from "./navegacao";
export function LayoutApp({ children }: { children: React.ReactNode }) { return <div className="app-shell"><div className="conteudo">{children}</div><Navegacao /></div>; }
