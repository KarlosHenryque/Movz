import { z } from "zod";

const opcionalNumero = (minimo: number, maximo: number, mensagem: string) =>
  z.preprocess(
    (valor) => (valor === "" || valor === null ? undefined : valor),
    z.coerce.number().min(minimo, mensagem).max(maximo, mensagem).optional(),
  );

export const perfilSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  altura_cm: opcionalNumero(50, 300, "Informe uma altura válida"),
  peso_kg: opcionalNumero(20, 500, "Informe um peso válido"),
});

export const emailSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido"),
});

export const senhaForteSchema = z
  .string()
  .min(12, "A senha deve ter ao menos 12 caracteres")
  .regex(/[a-z]/, "A senha deve incluir uma letra minúscula")
  .regex(/[A-Z]/, "A senha deve incluir uma letra maiúscula")
  .regex(/[0-9]/, "A senha deve incluir um número")
  .regex(/[^A-Za-z0-9]/, "A senha deve incluir um símbolo");

export const senhaForteSchema = z.string()
  .min(12, "A senha deve ter ao menos 12 caracteres")
  .regex(/[a-z]/, "Inclua uma letra minúscula")
  .regex(/[A-Z]/, "Inclua uma letra maiúscula")
  .regex(/[0-9]/, "Inclua um número")
  .regex(/[^A-Za-z0-9]/, "Inclua um símbolo");

const camposNovaSenha = {
  nova_senha: senhaForteSchema,
  confirmar_senha: z.string(),
};

export const senhaSchema = z
  .object({
    senha_atual: z.string().min(8, "Informe sua senha atual"),
    ...camposNovaSenha,
  })
  .refine((dados) => dados.nova_senha === dados.confirmar_senha, {
    path: ["confirmar_senha"],
    message: "As senhas não coincidem",
  })
  .refine((dados) => dados.nova_senha !== dados.senha_atual, {
    path: ["nova_senha"],
    message: "A nova senha deve ser diferente da atual",
  });

export const novaSenhaSchema = z
  .object(camposNovaSenha)
  .refine((dados) => dados.nova_senha === dados.confirmar_senha, {
    path: ["confirmar_senha"],
    message: "As senhas não coincidem",
  });

export type EstadoFormulario = {
  sucesso?: string;
  erro?: string;
  campos?: Record<string, string[]>;
};
