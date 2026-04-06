"use client";

import { useState } from "react";
import { Trash2, ArrowRight, CheckCircle } from "lucide-react";
import { Button, IconButton } from "@/components/ui-custom";
import { minimizeDebts, type Transaction } from "@/lib/calculator";

interface Row {
  name: string;
  paid: string;
}

const buildRows = (names?: string[]): Row[] =>
  names?.length
    ? names.map((name) => ({ name, paid: "" }))
    : [{ name: "", paid: "" }, { name: "", paid: "" }];

interface Props {
  initialParticipants?: string[]
}

export function ExpenseSettlement({ initialParticipants }: Props = {}) {
  const [rows, setRows] = useState<Row[]>(() => buildRows(initialParticipants));
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateRow = (index: number, field: keyof Row, value: string) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
    setTransactions(null);
  };

  const handleCalculate = () => {
    setError(null);
    setTransactions(null);

    for (let i = 0; i < rows.length; i++) {
      const paid = parseFloat(rows[i].paid);
      if (rows[i].paid === "" || isNaN(paid) || paid < 0) {
        setError(
          `El monto de "${rows[i].name.trim() || `Persona ${i + 1}`}" no es válido.`
        );
        return;
      }
    }

    const participants = rows.map((r, i) => ({
      name: r.name.trim() || `Persona ${i + 1}`,
      paid: parseFloat(r.paid),
    }));

    setTransactions(minimizeDebts(participants));
  };

  const handleReset = () => {
    setRows(buildRows(initialParticipants));
    setTransactions(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Header labels */}
      <div className="flex gap-2 items-center px-1">
        <span className="flex-1 text-xs font-medium text-muted-foreground">
          Nombre
        </span>
        <span className="w-28 text-xs font-medium text-muted-foreground">
          Lo que pagó
        </span>
        <span className="w-7" />
      </div>

      {/* Participant rows */}
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder={`Persona ${i + 1}`}
              value={row.name}
              onChange={(e) => updateRow(i, "name", e.target.value)}
              className="flex-1 px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
            />
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={row.paid}
              onChange={(e) => updateRow(i, "paid", e.target.value)}
              className="w-28 px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
            />
            <IconButton
              icon={Trash2}
              variant="danger"
              label="Eliminar persona"
              onClick={() =>
                setRows((prev) => prev.filter((_, idx) => idx !== i))
              }
              disabled={rows.length <= 2}
            />
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        className="w-full text-sm"
        onClick={() =>
          rows.length < 15 && setRows((prev) => [...prev, { name: "", paid: "" }])
        }
        disabled={rows.length >= 15}
      >
        + Añadir persona
      </Button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button className="w-full" onClick={handleCalculate}>
        Calcular liquidación
      </Button>

      {/* Results */}
      {transactions !== null && (
        <div className="space-y-2 pt-1">
          {transactions.length === 0 ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-5 flex items-center gap-3">
              <CheckCircle className="text-green-500 shrink-0" size={22} />
              <div>
                <p className="font-semibold text-green-800 text-sm">
                  Todo está igualado
                </p>
                <p className="text-green-700 text-xs">
                  Nadie debe nada. El gasto ya está repartido equitativamente.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                {transactions.length} transferencia
                {transactions.length > 1 ? "s" : ""} para liquidar
              </p>
              {transactions.map((t, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 flex items-center gap-2 flex-wrap"
                >
                  <span className="font-semibold text-foreground text-sm">
                    {t.from}
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-muted-foreground shrink-0"
                  />
                  <span className="font-bold text-blue-700 text-sm">
                    {t.amount.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-muted-foreground shrink-0"
                  />
                  <span className="font-semibold text-foreground text-sm">
                    {t.to}
                  </span>
                </div>
              ))}
            </>
          )}

          <Button
            variant="secondary"
            className="w-full text-sm"
            onClick={handleReset}
          >
            Nueva liquidación
          </Button>
        </div>
      )}
    </div>
  );
}
