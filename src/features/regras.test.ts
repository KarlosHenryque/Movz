import { describe, expect, it } from "vitest";
import { calcularVolumeSerie, calcularVolumeTotal, cargaMaxima } from "./treinos/regras";
import { proximaCompetencia, resumirDespesas } from "./financeiro/regras";
import { exercicioSchema } from "./exercicios/validacoes";
import { emailSchema, novaSenhaSchema, perfilSchema, senhaSchema } from "./perfil/validacoes";
describe("treinos", () => { it("calcula volume", () => { expect(calcularVolumeSerie({carga:30,repeticoes:10})).toBe(300); expect(calcularVolumeTotal([{carga:30,repeticoes:10},{carga:32,repeticoes:8}])).toBe(556); }); it("obtém carga máxima",()=>expect(cargaMaxima([{carga:30,repeticoes:10},{carga:32,repeticoes:8}])).toBe(32)); });
describe("financeiro",()=>{ it("separa gastos",()=>expect(resumirDespesas([{valor:120,tipo:"FIXA"},{valor:75,tipo:"VARIAVEL"}])).toEqual({total:195,fixo:120,variavel:75})); it("ajusta recorrência no fim do mês",()=>expect(proximaCompetencia(new Date("2026-01-31T00:00:00Z")).toISOString().slice(0,10)).toBe("2026-02-28")); });
describe("validações",()=>it("rejeita exercício inválido",()=>expect(exercicioSchema.safeParse({nome:"",grupo_muscular:"PEITO"}).success).toBe(false)));
describe("perfil", () => {
  it("aceita altura e peso válidos", () => expect(perfilSchema.safeParse({ nome: "Karlos", altura_cm: "175.5", peso_kg: "82.3" }).success).toBe(true));
  it("rejeita medidas fora dos limites", () => expect(perfilSchema.safeParse({ nome: "Karlos", altura_cm: "20", peso_kg: "900" }).success).toBe(false));
  it("aceita medidas opcionais vazias", () => expect(perfilSchema.safeParse({ nome: "Karlos", altura_cm: "", peso_kg: "" }).success).toBe(true));
  it("valida o formato do e-mail", () => expect(emailSchema.safeParse({ email: "invalido" }).success).toBe(false));
  it("exige confirmação e senha nova diferente", () => {
    expect(senhaSchema.safeParse({ senha_atual: "senha-atual", nova_senha: "senha-atual", confirmar_senha: "senha-atual" }).success).toBe(false);
    expect(novaSenhaSchema.safeParse({ nova_senha: "nova-senha", confirmar_senha: "diferente" }).success).toBe(false);
  });
});
