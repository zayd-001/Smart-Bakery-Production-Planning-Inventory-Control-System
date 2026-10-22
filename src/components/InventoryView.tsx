import React, { useState } from 'react';
import { ProductParams, CapacityLimits, InventoryState, OptimizationSolution } from '../types/bakery';
import { formatIDR } from '../utils/solver';
import { CheckCircle2, RefreshCw } from 'lucide-react';

interface InventoryViewProps {
  bread: ProductParams;
  cake: ProductParams;
  capacity: CapacityLimits;
  setCapacity: React.Dispatch<React.SetStateAction<CapacityLimits>>;
  inventory: InventoryState;
  setInventory: React.Dispatch<React.SetStateAction<InventoryState>>;
  solution: OptimizationSolution;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  bread,
  cake,
  capacity,
  setCapacity,
  inventory,
  setInventory,
  solution,
}) => {
  // What-If Simulation inputs
  const [simBread, setSimBread] = useState<number>(100);
  const [simCake, setSimCake] = useState<number>(40);
  const [simEvaluated, setSimEvaluated] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const materialsMeta = [
    { key: 'flour' as const, name: 'Wheat Flour (High Protein)', unit: 'kg' },
    { key: 'sugar' as const, name: 'Refined Cane Sugar', unit: 'kg' },
    { key: 'eggs' as const, name: 'Farm Fresh Eggs', unit: 'pcs' },
  ];

  const handleSyncCapacity = () => {
    setCapacity((prev) => ({
      ...prev,
      flour: inventory.flour.stock,
      sugar: inventory.sugar.stock,
      eggs: inventory.eggs.stock,
    }));
    setSyncFeedback(
      `Capacity constraints successfully synchronized with current warehouse stocks: Flour (${inventory.flour.stock} kg), Sugar (${inventory.sugar.stock} kg), and Eggs (${inventory.eggs.stock} pcs).`
    );
    setTimeout(() => {
      setSyncFeedback(null);
    }, 4500);
  };

  // Run simulation evaluation
  const pB = bread.sellingPrice - bread.variableCost;
  const pC = cake.sellingPrice - cake.variableCost;

  const simFlour = bread.flour * simBread + cake.flour * simCake;
  const simSugar = bread.sugar * simBread + cake.sugar * simCake;
  const simEggs = bread.eggs * simBread + cake.eggs * simCake;
  const simOven = bread.oven * simBread + cake.oven * simCake;
  const simLabor = bread.labor * simBread + cake.labor * simCake;
  const simProfit = pB * simBread + pC * simCake;

  const violations: string[] = [];
  if (simFlour > capacity.flour) violations.push(`Flour shortage of ${(simFlour - capacity.flour).toFixed(1)} kg`);
  if (simSugar > capacity.sugar) violations.push(`Sugar shortage of ${(simSugar - capacity.sugar).toFixed(1)} kg`);
  if (simEggs > capacity.eggs) violations.push(`Eggs shortage of ${(simEggs - capacity.eggs).toFixed(0)} pcs`);
  if (simOven > capacity.oven) violations.push(`Oven overload of ${(simOven - capacity.oven).toFixed(1)} minutes`);
  if (simLabor > capacity.labor) violations.push(`Labor shortage of ${(simLabor - capacity.labor).toFixed(1)} worker-minutes`);
  if (simBread > bread.maxDemand) violations.push(`Bread exceeds market demand cap of ${bread.maxDemand}`);
  if (simCake > cake.maxDemand) violations.push(`Cake exceeds market demand cap of ${cake.maxDemand}`);

  const isSimFeasible = violations.length === 0;

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Raw Material Inventory Control &amp; Safety Stock Surveillance
        </h2>
        <p className="text-xs text-slate-500">
          Inventory balance equations (I_end = I_0 - C), stockout risk quantification, and safety buffer integrity.
        </p>
      </div>

      {/* Stock & Buffer Input Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Inventory Stock &amp; Buffer Threshold Configuration</h3>
            <p className="text-xs text-slate-500">Edit current warehouse stock ($I_0$) and established safety buffers ($SS$)</p>
          </div>
          <button
            type="button"
            onClick={handleSyncCapacity}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-2xs whitespace-nowrap min-h-[32px]"
            title="Update optimizer RHS material bounds with current inventory stock"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync Stock with Capacity Constraints</span>
          </button>
        </div>

        {syncFeedback && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-2xs animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium break-words">{syncFeedback}</span>
          </div>
        )}

        <div className="overflow-x-auto border border-slate-200 rounded-lg w-full">
          <table className="w-full min-w-[540px] text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Raw Material</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">Current Stock (I_0)</th>
                <th className="py-2.5 px-3">Safety Stock Buffer (SS)</th>
                <th className="py-2.5 px-3">Unit Purchase Cost (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materialsMeta.map((m) => {
                const item = inventory[m.key];
                return (
                  <tr key={m.key} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{m.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{m.unit}</td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        step={m.unit === 'pcs' ? '1' : '0.5'}
                        value={item.stock}
                        onChange={(e) =>
                          setInventory({
                            ...inventory,
                            [m.key]: { ...item, stock: Math.max(0, parseFloat(e.target.value) || 0) },
                          })
                        }
                        className="w-28 px-2 py-1 border border-slate-300 rounded focus:border-amber-500 focus:outline-none font-mono-numbers text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        step={m.unit === 'pcs' ? '1' : '0.5'}
                        value={item.ss}
                        onChange={(e) =>
                          setInventory({
                            ...inventory,
                            [m.key]: { ...item, ss: Math.max(0, parseFloat(e.target.value) || 0) },
                          })
                        }
                        className="w-28 px-2 py-1 border border-slate-300 rounded focus:border-amber-500 focus:outline-none font-mono-numbers text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={item.unitCost}
                        onChange={(e) =>
                          setInventory({
                            ...inventory,
                            [m.key]: { ...item, unitCost: Math.max(0, parseFloat(e.target.value) || 0) },
                          })
                        }
                        className="w-32 px-2 py-1 border border-slate-300 rounded focus:border-amber-500 focus:outline-none font-mono-numbers text-xs"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Balance Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Inventory Balance &amp; Shortage Assessment</h3>
        <p className="text-xs text-slate-500">
          Post-shift stock balances calculated via I(end) = I(0) - C. Warnings trigger when I(end) &lt; SS.
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-lg w-full">
          <table className="w-full min-w-[700px] text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Material</th>
                <th className="py-2.5 px-3 text-right">Current Stock (I_0)</th>
                <th className="py-2.5 px-3 text-right">Shift Consumed (C)</th>
                <th className="py-2.5 px-3 text-right">Ending Balance (I_end)</th>
                <th className="py-2.5 px-3 text-right">Safety Buffer (SS)</th>
                <th className="py-2.5 px-3 text-right">Shortage</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Suggested PPIC Replenishment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materialsMeta.map((m) => {
                const item = inventory[m.key];
                const used = solution.used[m.key];
                const ending = item.stock - used;
                const shortage = Math.max(0, used - item.stock);

                let badge = (
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Sufficient Stock
                  </span>
                );
                let note = 'Stock level remains healthy above established safety buffer.';

                if (shortage > 0) {
                  badge = (
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      Shortage Alert
                    </span>
                  );
                  note = `Immediate rush procurement required for ${shortage.toFixed(1)} ${m.unit} to fulfill plan.`;
                } else if (ending < item.ss) {
                  badge = (
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Low Stock (&lt; SS)
                    </span>
                  );
                  note = `Stock will dip below buffer by ${(item.ss - ending).toFixed(1)} ${m.unit}. Trigger routine EOQ purchase order.`;
                }

                return (
                  <tr key={m.key} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{m.name}</td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">
                      {item.stock.toFixed(1)} {m.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">
                      {used.toFixed(1)} {m.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers font-bold text-slate-900 text-right">
                      <span className={ending < item.ss ? 'text-amber-700' : 'text-slate-900'}>
                        {ending.toFixed(1)} {m.unit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">
                      {item.ss.toFixed(1)} {m.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers text-right">
                      <span className={shortage > 0 ? 'text-rose-700 font-bold' : 'text-slate-400'}>
                        {shortage.toFixed(1)} {m.unit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">{badge}</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs">{note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* What-If Simulation Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            What-If Simulation: Manual Production Plan Feasibility Checker
          </h3>
          <p className="text-xs text-slate-500">
            Simulate custom product batch quantities against current facility capacities and inventory stock
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Simulated Bread (x):</label>
            <input
              type="number"
              min="0"
              step="1"
              value={simBread}
              onChange={(e) => {
                setSimBread(Math.max(0, parseInt(e.target.value, 10) || 0));
                setSimEvaluated(true);
              }}
              className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none font-mono-numbers"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Simulated Cake (y):</label>
            <input
              type="number"
              min="0"
              step="1"
              value={simCake}
              onChange={(e) => {
                setSimCake(Math.max(0, parseInt(e.target.value, 10) || 0));
                setSimEvaluated(true);
              }}
              className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none font-mono-numbers"
            />
          </div>

          <button
            type="button"
            onClick={() => setSimEvaluated(true)}
            className="px-3.5 py-1.5 font-semibold text-xs text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
          >
            Evaluate Simulated Plan
          </button>
        </div>

        {simEvaluated && (
          <div
            className={`p-4 rounded-lg border text-xs leading-relaxed ${
              isSimFeasible
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            {isSimFeasible ? (
              <div className="space-y-1">
                <strong className="text-emerald-900 text-sm block">Plan Feasible</strong>
                <p>
                  Simulated schedule ($x={simBread}, y={simCake}$) strictly satisfies all factory capacity limits and raw material stocks.
                </p>
                <div className="font-semibold pt-1">
                  Projected Net Profit: <span className="font-mono-numbers text-sm text-emerald-900">{formatIDR(simProfit)}</span>
                  {simProfit < solution.profit && (
                    <span className="text-slate-600 font-normal ml-2">
                      (Note: This is {formatIDR(solution.profit - simProfit)} below the global maximum optimal profit of {formatIDR(solution.profit)}).
                    </span>
                  )}
                  {simProfit === solution.profit && (
                    <span className="text-emerald-700 font-bold ml-2">
                      (Achieves optimal benchmark profit!).
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <strong className="text-rose-900 text-sm block">Plan Infeasible (Constraint Violations Detected)</strong>
                <p>The simulated plan violates the following scarce operational boundaries:</p>
                <ul className="list-disc list-inside space-y-0.5 text-rose-800 font-mono-numbers font-medium text-[11px]">
                  {violations.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
