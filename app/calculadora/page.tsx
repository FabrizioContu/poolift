"use client";

import Link from "next/link";
import { ArrowLeft, Calculator } from "lucide-react";
import { Tabs } from "@/components/ui-custom";
import { SplitSimple } from "./SplitSimple";
import { LiquidacionGastos } from "./LiquidacionGastos";

const TABS = [
  { id: "split", label: "Dividir gasto" },
  { id: "liquidar", label: "Liquidar gastos" },
];

export default function CalculadoraPage() {
  return (
    <div className="force-light min-h-screen bg-white">
      <main className="container mx-auto px-4 py-12 max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-8 text-sm transition"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
            <Calculator className="text-orange-500" size={22} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Calculadora de gastos
          </h1>
        </div>
        <p className="text-muted-foreground text-sm mb-8">
          Divide un gasto entre varios o liquida deudas entre el grupo.
        </p>

        <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
          <Tabs tabs={TABS} defaultTab="split">
            {(activeTab) => (
              <>
                {activeTab === "split" && <SplitSimple />}
                {activeTab === "liquidar" && <LiquidacionGastos />}
              </>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
