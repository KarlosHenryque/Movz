import Link from "next/link"; import { Dumbbell, Home, Landmark, UserRound, ListChecks } from "lucide-react";
const itens = [["/", "Início", Home], ["/treinos", "Treinos", Dumbbell], ["/exercicios", "Exercícios", ListChecks], ["/financeiro", "Financeiro", Landmark], ["/perfil", "Perfil", UserRound]] as const;
export function Navegacao() { return <nav className="nav-inferior" aria-label="Navegação principal">{itens.map(([href, nome, Icone]) => <Link key={href} href={href}><Icone size={21}/><span>{nome}</span></Link>)}</nav>; }
