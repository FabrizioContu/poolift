export interface Participant {
  name: string;
  paid: number;
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export interface SplitResult {
  perPerson: number;
  breakdown: { name: string; amount: number }[];
}

export function splitEvenly(total: number, names: string[]): SplitResult {
  if (names.length < 1) throw new Error("Se necesita al menos una persona");
  const perPerson = total / names.length;
  return {
    perPerson,
    breakdown: names.map((name) => ({ name, amount: perPerson })),
  };
}

/**
 * Greedy two-pointer algorithm: computes the minimum number of transactions
 * needed to settle debts among a group where multiple people paid different amounts.
 *
 * Steps:
 * 1. Compute net balance per person (paid - fair share)
 * 2. Split into creditors (positive) and debtors (negative), sorted desc by abs value
 * 3. Match largest debtor with largest creditor, settle the minimum of both,
 *    advance the pointer that reaches 0
 */
export function minimizeDebts(participants: Participant[]): Transaction[] {
  if (participants.length < 2) return [];

  const total = participants.reduce((s, p) => s + p.paid, 0);
  const perPerson = total / participants.length;

  const debtors: { name: string; amount: number }[] = [];
  const creditors: { name: string; amount: number }[] = [];

  for (const p of participants) {
    const net = parseFloat((p.paid - perPerson).toFixed(10));
    if (net < -0.001) debtors.push({ name: p.name, amount: -net });
    if (net > 0.001) creditors.push({ name: p.name, amount: net });
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: Transaction[] = [];
  let d = 0,
    c = 0;

  while (d < debtors.length && c < creditors.length) {
    const settle = Math.min(debtors[d].amount, creditors[c].amount);
    transactions.push({
      from: debtors[d].name,
      to: creditors[c].name,
      amount: parseFloat(settle.toFixed(2)),
    });
    debtors[d].amount -= settle;
    creditors[c].amount -= settle;
    if (debtors[d].amount < 0.001) d++;
    if (creditors[c].amount < 0.001) c++;
  }

  return transactions;
}
