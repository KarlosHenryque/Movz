import { z } from "zod";
export const despesaSchema = z.object({
  descricao: z.string().trim().min(2),
  valor: z.coerce.number().positive().max(999999999),
  categoria_id: z.coerce.number().int().positive(),
  data: z.coerce.date(),
  tipo: z.enum(["FIXA", "VARIAVEL"]),
  observacao: z.string().max(1000).optional(),
});
