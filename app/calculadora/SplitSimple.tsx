"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui-custom";
import { splitEvenly, type SplitResult } from "@/lib/calculadora";

export function SplitSimple() {
  const [total, setTotal] = useState("");
  const [count, setCount] = useState("2");
  const [names, setNames] = useState<string[]>(["", ""]);
  const [showNames, setShowNames] = useState(false);
  const [result, setResult] = useState<SplitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCountChange = (value: string) => {
    setCount(value);
    const n = parseInt(value) || 0;
    if (n >= 2 && n <= 20) {
      setNames((prev) => {
        const updated = [...prev];
        while (updated.length < n) updated.push("");
        return updated.slice(0, n);
      });
    }
    setResult(null);
  };

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const totalNum = parseFloat(total);
    const countNum = parseInt(count);

    if (!total || isNaN(totalNum) || totalNum <= 0) {
      setError("Ingresá un monto total válido mayor a 0.");
      return;
    }
    if (isNaN(countNum) || countNum < 2) {
      setError("Se necesitan al menos 2 personas.");
      return;
    }
    if (countNum > 20) {
      setError("Máximo 20 personas.");
      return;
    }

    const resolvedNames = names
      .slice(0, countNum)
      .map((n, i) => n.trim() || `Persona ${i + 1}`);

    setResult(splitEvenly(totalNum, resolvedNames));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Gasto total
        </label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={total}
          onChange={(e) => {
            setTotal(e.target.value);
            setResult(null);
          }}
          className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Número de personas
        </label>
        <input
          type="number"
          min="2"
          max="20"
          value={count}
          onChange={(e) => handleCountChange(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowNames((v) => !v)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
        >
          {showNames ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Añadir nombres (opcional)
        </button>
        {showNames && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {names.map((name, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Persona ${i + 1}`}
                value={name}
                onChange={(e) =>
                  setNames((prev) =>
                    prev.map((n, idx) => (idx === i ? e.target.value : n))
                  )
                }
                className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
              />
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button className="w-full" onClick={handleCalculate}>
        Calcular
      </Button>

      {result && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 space-y-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Cada persona paga
            </p>
            <p className="text-4xl font-bold text-orange-600">
              {result.perPerson.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          {showNames && (
            <ul className="space-y-1 border-t border-orange-200 pt-3">
              {result.breakdown.map(({ name, amount }) => (
                <li key={name} className="flex justify-between text-sm">
                  <span className="text-foreground">{name}</span>
                  <span className="font-medium text-foreground">
                    {amount.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
