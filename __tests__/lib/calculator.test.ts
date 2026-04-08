import { describe, it, expect } from "vitest";
import { splitEvenly, minimizeDebts } from "@/lib/calculator";

// ─── splitEvenly ─────────────────────────────────────────────────────────────

describe("splitEvenly", () => {
  it("divide equitativamente entre 2 personas", () => {
    const result = splitEvenly(100, ["Ana", "Luis"]);
    expect(result.perPerson).toBe(50);
    expect(result.breakdown).toEqual([
      { name: "Ana", amount: 50 },
      { name: "Luis", amount: 50 },
    ]);
  });

  it("divide entre 3 personas sin residuo", () => {
    const result = splitEvenly(90, ["A", "B", "C"]);
    expect(result.perPerson).toBe(30);
    expect(result.breakdown).toHaveLength(3);
  });

  it("admite montos con decimales", () => {
    const result = splitEvenly(10, ["X", "Y", "Z"]);
    expect(result.perPerson).toBeCloseTo(3.333, 2);
    result.breakdown.forEach((b) => expect(b.amount).toBeCloseTo(3.333, 2));
  });

  it("lanza error si no hay personas", () => {
    expect(() => splitEvenly(100, [])).toThrow("Se necesita al menos una persona");
  });

  it("funciona con una sola persona", () => {
    const result = splitEvenly(75, ["Solo"]);
    expect(result.perPerson).toBe(75);
    expect(result.breakdown[0]).toEqual({ name: "Solo", amount: 75 });
  });
});

// ─── minimizeDebts ────────────────────────────────────────────────────────────

describe("minimizeDebts", () => {
  it("retorna [] con menos de 2 participantes", () => {
    expect(minimizeDebts([{ name: "Ana", paid: 100 }])).toEqual([]);
    expect(minimizeDebts([])).toEqual([]);
  });

  it("retorna [] cuando todos pagaron lo mismo", () => {
    const participants = [
      { name: "Ana", paid: 30 },
      { name: "Luis", paid: 30 },
      { name: "Marta", paid: 30 },
    ];
    expect(minimizeDebts(participants)).toEqual([]);
  });

  it("caso simple: uno pagó todo, otro no pagó nada", () => {
    const participants = [
      { name: "Ana", paid: 100 },
      { name: "Luis", paid: 0 },
    ];
    const txs = minimizeDebts(participants);
    expect(txs).toHaveLength(1);
    expect(txs[0]).toEqual({ from: "Luis", to: "Ana", amount: 50 });
  });

  it("caso 3 personas: uno pagó todo", () => {
    const participants = [
      { name: "Ana", paid: 90 },
      { name: "Luis", paid: 0 },
      { name: "Marta", paid: 0 },
    ];
    const txs = minimizeDebts(participants);
    // Luis y Marta deben 30 c/u a Ana
    expect(txs).toHaveLength(2);
    txs.forEach((t) => {
      expect(t.to).toBe("Ana");
      expect(t.amount).toBe(30);
    });
    const debtors = txs.map((t) => t.from).sort();
    expect(debtors).toEqual(["Luis", "Marta"]);
  });

  it("caso clásico: pagos desiguales generan transacciones mínimas", () => {
    // Total 120, perPerson 40
    // Ana +60 (acreedor), Luis +0 (acreedor), Marta -20 (deudor), Pedro -40 (deudor)
    const participants = [
      { name: "Ana", paid: 100 },  // net +60
      { name: "Luis", paid: 40 },  // net 0
      { name: "Marta", paid: 20 }, // net -20
      { name: "Pedro", paid: 0 },  // net -40
    ];
    const txs = minimizeDebts(participants);
    const totalTransferred = txs.reduce((s, t) => s + t.amount, 0);
    // Todos los deudores deben saldar 60 en total
    expect(totalTransferred).toBeCloseTo(60, 1);
    txs.forEach((t) => {
      expect(t.amount).toBeGreaterThan(0);
      expect(t.from).toBeDefined();
      expect(t.to).toBeDefined();
    });
  });

  it("maneja correctamente floats sin generar transacciones fantasma", () => {
    // 10 / 3 genera infinitos decimales; no debe haber transacciones negativas
    const participants = [
      { name: "A", paid: 10 },
      { name: "B", paid: 0 },
      { name: "C", paid: 0 },
    ];
    const txs = minimizeDebts(participants);
    txs.forEach((t) => expect(t.amount).toBeGreaterThan(0));
  });
});
