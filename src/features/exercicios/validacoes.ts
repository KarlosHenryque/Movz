import { z } from "zod";
export const gruposMusculares = [
  "PEITO",
  "COSTAS",
  "OMBROS",
  "BICEPS",
  "TRICEPS",
  "PERNAS",
  "GLUTEOS",
  "ABDOMEN",
  "CARDIO",
  "OUTROS",
] as const;
export const exercicioSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome"),
  grupo_muscular: z.enum(gruposMusculares),
  observacoes: z.string().trim().max(1000).optional(),
  ativo: z.boolean().default(true),
});
