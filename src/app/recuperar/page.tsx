import { FormularioAuth } from "@/components/formulario-auth"; import { recuperar } from "@/features/autenticacao/acoes";
export default function Page() { return <FormularioAuth titulo="Recuperar acesso" acao={recuperar} recuperar />; }
