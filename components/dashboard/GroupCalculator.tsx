"use client";

import { Tabs } from "@/components/ui-custom";
import { SplitEvenly } from "@/app/calculator/SplitEvenly";
import { ExpenseSettlement } from "@/app/calculator/ExpenseSettlement";

interface Props {
  families: { id: string; name: string }[];
}

const TABS = [
  { id: "split", label: "Dividir gasto" },
  { id: "settle", label: "Liquidar gastos" },
];

export function GroupCalculator({ families }: Props) {
  const names = families.map((f) => f.name);
  return (
    <div className="mt-2">
      <Tabs tabs={TABS} defaultTab="split">
        {(activeTab) => (
          <>
            {activeTab === "split" && <SplitEvenly initialNames={names} />}
            {activeTab === "settle" && (
              <ExpenseSettlement initialParticipants={names} />
            )}
          </>
        )}
      </Tabs>
    </div>
  );
}
