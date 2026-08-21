import { describe, expect, it } from "vitest";
import { calcularVolumeSerie, calcularVolumeTotal, cargaMaxima } from "./treinos/regras";
import { proximaCompetencia, resumirDespesas } from "./financeiro/regras";
import { exercicioSchema } from "./exercicios/validacoes";
describe("treinos", () => { it("calcula volume", () => { expect(calcularVolumeSerie({carga:30,repeticoes:10})).toBe(300); expect(calcularVolumeTotal([{carga:30,repeticoes:10},{carga:32,repeticoes:8}])).toBe(556); }); it("obtém carga máxima",()=>expect(cargaMaxima([{carga:30,repeticoes:10},{carga:32,repeticoes:8}])).toBe(32)); });
describe("financeiro",()=>{ it("separa gastos",()=>expect(resumirDespesas([{valor:120,tipo:"FIXA"},{valor:75,tipo:"VARIAVEL"}])).toEqual({total:195,fixo:120,variavel:75})); it("ajusta recorrência no fim do mês",()=>expect(proximaCompetencia(new Date("2026-01-31T00:00:00Z")).toISOString().slice(0,10)).toBe("2026-02-28")); });
describe("validações",()=>it("rejeita exercício inválido",()=>expect(exercicioSchema.safeParse({nome:"",grupo_muscular:"PEITO"}).success).toBe(false)));
