import React from 'react';
import { ProductParams, CapacityLimits, InventoryState, OptimizationSolution } from '../types/bakery';
import { formatIDR } from '../utils/solver';
import { Printer } from 'lucide-react';

interface PlanViewProps {
  bread: ProductParams;
  cake: ProductParams;
  capacity: CapacityLimits;
  inventory: InventoryState;
  solution: OptimizationSolution;
  onPrint: () => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
  bread,
  cake,
  capacity,
  inventory,
  solution,
  onPrint,
}) => {
  const materials = [
    {
      name: 'High-Protein Flour',
      unit: 'kg',
      breadAlloc: bread.flour * solution.x,
      cakeAlloc: cake.flour * solution.y,
      total: solution.used.flour,
      stock: inventory.flour.stock,
    },
    {
      name: 'Refined Cane Sugar',
      unit: 'kg',
      breadAlloc: bread.sugar * solution.x,
      cakeAlloc: cake.sugar * solution.y,
      total: solution.used.sugar,
      stock: inventory.sugar.stock,
    },
    {
      name: 'Farm Fresh Eggs',
      unit: 'pcs',
      breadAlloc: bread.eggs * solution.x,
      cakeAlloc: cake.eggs * solution.y,
      total: solution.used.eggs,
      stock: inventory.eggs.stock,
    },
  ];

  const stations = [
    {
      name: 'Commercial Baking Oven Station',
      unit: 'min',
      breadLoad: bread.oven * solution.x,
      cakeLoad: cake.oven * solution.y,
      total: solution.used.oven,
      capacity: capacity.oven,
      util: solution.utilization.oven,
    },
    {
      name: 'Prep, Mixing & Shaping Labor Station',
      unit: 'worker-min',
      breadLoad: bread.labor * solution.x,
      cakeLoad: cake.labor * solution.y,
      total: solution.used.labor,
      capacity: capacity.labor,
      util: solution.utilization.labor,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Master Production Schedule (MPS)</h2>
          <p className="text-xs text-slate-500">
            Operationally scheduled batch execution, labor dispatch, and bill of materials (BOM) explosion.
          </p>
        </div>
        <button
          type="button"
          onClick={onPrint}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Print Schedule Sheet</span>
        </button>
      </div>

      {/* Target Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Planning Horizon</span>
          <span className="text-sm font-extrabold text-slate-900 mt-1 block">Daily Cycle (1 Shift / 8h)</span>
          <span className="text-[11px] text-slate-400">Fixed shift production</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Artisan Bread Batch</span>
          <span className="text-xl font-black text-slate-900 mt-1 block font-mono-numbers">{solution.x} units</span>
          <span className="text-[11px] text-slate-500">{bread.name}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Chiffon Cake Batch</span>
          <span className="text-xl font-black text-slate-900 mt-1 block font-mono-numbers">{solution.y} units</span>
          <span className="text-[11px] text-slate-500">{cake.name}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-300 shadow-2xs bg-gradient-to-b from-white to-amber-50/40">
          <span className="text-[11px] uppercase tracking-wider text-amber-800 font-semibold block">Projected Contribution</span>
          <span className="text-xl font-black text-amber-700 mt-1 block font-mono-numbers">{formatIDR(solution.profit)}</span>
          <span className="text-[11px] text-slate-500">Gross revenue minus variable costs</span>
        </div>
      </div>

      {/* Exploded BOM Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Direct Ingredient Consumption Dispatch (Exploded BOM)</h3>
        <p className="text-xs text-slate-500">
          Material requirements exploded from technical BOM coefficients: Total(i) = BOM(i, bread) &times; x* + BOM(i, cake) &times; y*
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-lg w-full">
          <table className="w-full min-w-[600px] text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Material Designation</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Bread Allocation</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Cake Allocation</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Total Scheduled</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">On-Hand Stock (I_0)</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Post-Shift Balance</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Dispatch Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map((m) => {
                const rem = m.stock - m.total;
                const isShort = rem < 0;
                return (
                  <tr key={m.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{m.name}</td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">
                      {m.breadAlloc.toFixed(1)} {m.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">
                      {m.cakeAlloc.toFixed(1)} {m.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers font-bold text-slate-900 text-right">
                      {m.total.toFixed(1)} {m.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">
                      {m.stock.toFixed(1)} {m.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers font-semibold text-right">
                      <span className={isShort ? 'text-rose-700' : 'text-emerald-700'}>
                        {rem.toFixed(1)} {m.unit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                          isShort
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isShort ? 'Stockout Alert' : 'Allocated & Available'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workstation Workload Breakdown */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Workstation Workload Breakdown</h3>
        <p className="text-xs text-slate-500">
          Scheduled station minutes vs nominal single-shift capacity
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-lg w-full">
          <table className="w-full min-w-[600px] text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Station / Facility Asset</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Bread Workload</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Cake Workload</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Total Scheduled</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Shift Capacity</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Available Slack</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Load Factor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stations.map((s) => {
                const slack = s.capacity - s.total;
                return (
                  <tr key={s.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">
                      {s.breadLoad.toFixed(1)} {s.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">
                      {s.cakeLoad.toFixed(1)} {s.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers font-bold text-slate-900 text-right">
                      {s.total.toFixed(1)} {s.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">
                      {s.capacity.toFixed(0)} {s.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">
                      {slack.toFixed(1)} {s.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers font-bold text-right">
                      <span className={s.util >= 95 ? 'text-rose-700' : s.util >= 80 ? 'text-amber-700' : 'text-emerald-700'}>
                        {s.util.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supervisor Operational Directives */}
      <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 text-xs text-amber-950 space-y-2">
        <strong className="text-amber-900 block text-xs uppercase tracking-wider font-bold">
          Supervisor Shift Operational Directives:
        </strong>
        <ul className="list-disc list-inside space-y-1 text-slate-700">
          <li><strong>Pre-weighing Batching:</strong> Raw flour and sugar lots must be weighed and containerized prior to shift start (07:00) to ensure zero dough-mixing line starvation.</li>
          <li><strong>Thermal Sequencing:</strong> Prioritize Chiffon Cake continuous heating before Artisan Bread baking cycle to maintain steady cavity ambient temperatures without heat shocks.</li>
          <li><strong>Hygiene &amp; Egg Handling:</strong> Farm fresh eggs must undergo sanitation and temperature equilibration before batch cracking.</li>
        </ul>
      </div>
    </div>
  );
};
