import React, { useState } from 'react';
import {
  ProductParams,
  CapacityLimits,
  InventoryState,
  EOQState,
  OptimizationSolution,
} from '../types/bakery';
import { formatIDR, calculateEOQItem } from '../utils/solver';
import { Download, Printer } from 'lucide-react';

interface ReportsViewProps {
  bread: ProductParams;
  cake: ProductParams;
  capacity: CapacityLimits;
  inventory: InventoryState;
  eoq: EOQState;
  solution: OptimizationSolution;
  timestamp: string;
  onExportCSV: () => void;
  onPrint: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  bread,
  cake,
  capacity,
  inventory,
  eoq,
  solution,
  timestamp,
  onExportCSV,
  onPrint,
}) => {
  const [logoError, setLogoError] = useState(false);

  const pB = bread.sellingPrice - bread.variableCost;
  const pC = cake.sellingPrice - cake.variableCost;

  return (
    <div className="space-y-6">
      {/* Top Action Panel (Hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Engineering Executive Reports &amp; Data Export</h2>
          <p className="text-xs text-slate-500">
            Export certified production plans, inventory audit trails, and academic project deliverables.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV Dataset</span>
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Formal Report (A4)</span>
          </button>
        </div>
      </div>

      {/* Formal Paper Report Sheet */}
      <article className="report-sheet bg-white p-6 sm:p-10 rounded-xl border border-slate-300 shadow-sm text-slate-900 space-y-6">
        {/* Institutional Header */}
        <div className="flex items-center gap-4 pb-4 border-b-2 border-slate-900">
          <div className="w-16 h-16 shrink-0 flex items-center justify-center p-1 bg-white border border-slate-300 rounded">
            {!logoError ? (
              <img
                src="https://i.ibb.co.com/wNLd1f82/UPNVJ-LOGO.png"
                alt="UPNVJ Official Logo"
                className="max-w-full max-h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="font-extrabold text-xs text-slate-800 text-center">UPNVJ</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-extrabold tracking-wider uppercase text-slate-900">
              UNIVERSITAS PEMBANGUNAN NASIONAL VETERAN JAKARTA
            </h3>
            <h4 className="text-[11px] font-semibold text-slate-700">
              FACULTY OF ENGINEERING &bull; DEPARTMENT OF INDUSTRIAL ENGINEERING
            </h4>
            <p className="text-[10px] text-slate-600">
              Logic Programming Course Project &bull; Academic Year 2026 &bull; Class A &bull; Group 1
            </p>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1">
              OPERATIONS RESEARCH PRODUCTION &amp; INVENTORY AUDIT REPORT
            </h2>
          </div>
        </div>

        {/* Report Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <div>
            <strong className="text-slate-900 block mb-1">Student Engineering Investigators:</strong>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-700 font-medium">
              <li>Arinta Kalyca Atinnaputri (NIM: 2610312026)</li>
              <li>Zahratu Asyita (NIM: 2610312007)</li>
              <li>Abdulkareem Zayd Saleem (NIM: 2610312901)</li>
            </ol>
          </div>
          <div className="space-y-1 text-slate-700">
            <div><strong>Planning Horizon:</strong> Single Operational Day (1 Shift / 480 minutes)</div>
            <div><strong>System Category:</strong> Operations Research &amp; Decision Support System</div>
            <div><strong>Report Timestamp:</strong> <span className="font-mono-numbers">{timestamp}</span></div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            1. Executive Summary &amp; Recommended Decision Variables
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed">
            Based on the deterministic Integer Linear Programming formulation, the globally optimal production schedule is:
          </p>
          <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-lg text-xs text-amber-950 leading-relaxed">
            The optimization engine recommends scheduling <strong>{solution.x} units of {bread.name}</strong> ($x^*$) and{' '}
            <strong>{solution.y} units of {cake.name}</strong> ($y^*$).
            This daily batch configuration yields the maximum net contribution profit of{' '}
            <strong className="text-amber-800 font-mono-numbers">{formatIDR(solution.profit)}</strong>,
            strictly satisfying all shared raw material stocks, oven thermal capacity, and worker labor availability.
          </div>
        </section>

        {/* Section 2: Mathematical Formulation */}
        <section className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            2. Mathematical Model Formulation
          </h4>
          <div className="p-3.5 bg-slate-50 border-l-3 border-slate-700 text-xs text-slate-800 space-y-2 font-mono-numbers">
            <div>
              <span className="font-sans font-bold text-slate-900 block mb-0.5">Objective Function (Max Profit):</span>
              <div className="text-amber-700 font-semibold">
                Maximize P = ({formatIDR(pB)}) &times; x + ({formatIDR(pC)}) &times; y
              </div>
            </div>
            <div>
              <span className="font-sans font-bold text-slate-900 block mb-0.5">Subject to Operational Bounds:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                <li>Flour: {bread.flour}x + {cake.flour}y &le; {capacity.flour} kg</li>
                <li>Sugar: {bread.sugar}x + {cake.sugar}y &le; {capacity.sugar} kg</li>
                <li>Eggs: {bread.eggs}x + {cake.eggs}y &le; {capacity.eggs} pcs</li>
                <li>Oven Time: {bread.oven}x + {cake.oven}y &le; {capacity.oven} min</li>
                <li>Labor Time: {bread.labor}x + {cake.labor}y &le; {capacity.labor} worker-min</li>
                <li>Demand Bounds: 0 &le; x &le; {bread.maxDemand}, 0 &le; y &le; {cake.maxDemand} (x, y &isin; &integers;<sub>&ge;0</sub>)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Capacity Utilization */}
        <section className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            3. Capacity Utilization and Bottleneck Analysis
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Facility Resource</th>
                  <th className="py-2 px-3 text-right">Scheduled Load</th>
                  <th className="py-2 px-3 text-right">Shift Capacity</th>
                  <th className="py-2 px-3 text-right">Slack Surplus</th>
                  <th className="py-2 px-3 text-right">Utilization Rate</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 px-3 font-semibold">Oven Thermal Time</td>
                  <td className="py-2 px-3 text-right font-mono-numbers">{solution.used.oven.toFixed(1)} min</td>
                  <td className="py-2 px-3 text-right font-mono-numbers">{capacity.oven} min</td>
                  <td className="py-2 px-3 text-right font-mono-numbers">{solution.slack.oven.toFixed(1)} min</td>
                  <td className="py-2 px-3 text-right font-mono-numbers font-bold">{solution.utilization.oven.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-center">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                      {solution.utilization.oven >= 99.0 ? 'Active Bottleneck' : 'Slack Available'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Direct Labor Time</td>
                  <td className="py-2 px-3 text-right font-mono-numbers">{solution.used.labor.toFixed(1)} worker-min</td>
                  <td className="py-2 px-3 text-right font-mono-numbers">{capacity.labor} worker-min</td>
                  <td className="py-2 px-3 text-right font-mono-numbers">{solution.slack.labor.toFixed(1)} worker-min</td>
                  <td className="py-2 px-3 text-right font-mono-numbers font-bold">{solution.utilization.labor.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-center">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                      {solution.utilization.labor >= 99.0 ? 'Active Bottleneck' : 'Slack Available'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Material Requirements & Inventory */}
        <section className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            4. Material Requirements &amp; Ending Inventory Balances
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-lg w-full">
            <table className="w-full min-w-[540px] text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Material Designation</th>
                  <th className="py-2 px-3 text-right">Initial Stock (I_0)</th>
                  <th className="py-2 px-3 text-right">Batch Usage (C)</th>
                  <th className="py-2 px-3 text-right">Ending Balance (I_end)</th>
                  <th className="py-2 px-3 text-right">Safety Stock (SS)</th>
                  <th className="py-2 px-3 text-center">Inventory Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(['flour', 'sugar', 'eggs'] as const).map((key) => {
                  const names = { flour: 'Wheat Flour', sugar: 'Refined Sugar', eggs: 'Farm Fresh Eggs' };
                  const units = { flour: 'kg', sugar: 'kg', eggs: 'pcs' };
                  const inv = inventory[key];
                  const used = solution.used[key];
                  const end = inv.stock - used;
                  return (
                    <tr key={key}>
                      <td className="py-2 px-3 font-semibold">{names[key]}</td>
                      <td className="py-2 px-3 text-right font-mono-numbers">{inv.stock.toFixed(1)} {units[key]}</td>
                      <td className="py-2 px-3 text-right font-mono-numbers">{used.toFixed(1)} {units[key]}</td>
                      <td className="py-2 px-3 text-right font-mono-numbers font-bold">{end.toFixed(1)} {units[key]}</td>
                      <td className="py-2 px-3 text-right font-mono-numbers">{inv.ss.toFixed(1)} {units[key]}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${end < inv.ss ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                          {end < inv.ss ? 'Buffer Alert' : 'Sufficient Balance'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: EOQ Procurement Policy */}
        <section className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            5. Economic Order Quantity (EOQ) Procurement Policy
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-lg w-full">
            <table className="w-full min-w-[560px] text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Material</th>
                  <th className="py-2 px-3 text-right">Annual Demand (D)</th>
                  <th className="py-2 px-3 text-right">Theoretical EOQ</th>
                  <th className="py-2 px-3 text-right">Practical Lot (Q)</th>
                  <th className="py-2 px-3 text-right">Annual Orders (N)</th>
                  <th className="py-2 px-3 text-right">Total Annual Cost (TRC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(['flour', 'sugar', 'eggs'] as const).map((key) => {
                  const names = { flour: 'Wheat Flour', sugar: 'Refined Sugar', eggs: 'Farm Eggs' };
                  const units = { flour: 'kg', sugar: 'kg', eggs: 'pcs' };
                  const p = eoq[key];
                  const res = calculateEOQItem(p.D, p.S, p.H, p.pack);
                  return (
                    <tr key={key}>
                      <td className="py-2 px-3 font-semibold">{names[key]}</td>
                      <td className="py-2 px-3 text-right font-mono-numbers">{p.D.toLocaleString()} {units[key]}</td>
                      <td className="py-2 px-3 text-right font-mono-numbers">{res.theoreticalEOQ.toFixed(1)} {units[key]}</td>
                      <td className="py-2 px-3 text-right font-mono-numbers font-bold text-amber-700">{res.practicalQ} {units[key]}</td>
                      <td className="py-2 px-3 text-right font-mono-numbers">{res.ordersPerYear.toFixed(1)} / yr</td>
                      <td className="py-2 px-3 text-right font-mono-numbers font-bold">{formatIDR(res.totalCost)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Signature Certification Block */}
        <div className="report-signature-block pt-6 border-t border-dashed border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-8">
              Prepared by Modeling Lead:
            </div>
            <div className="font-bold text-slate-900">Arinta Kalyca Atinnaputri</div>
            <div className="text-[11px] font-mono-numbers text-slate-600">NIM: 2610312026</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-8">
              PPIC &amp; Inventory Specialist:
            </div>
            <div className="font-bold text-slate-900">Zahratu Asyita</div>
            <div className="text-[11px] font-mono-numbers text-slate-600">NIM: 2610312007</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-8">
              Systems Engineering Lead:
            </div>
            <div className="font-bold text-slate-900">Abdulkareem Zayd Saleem</div>
            <div className="text-[11px] font-mono-numbers text-slate-600">NIM: 2610312901</div>
          </div>
        </div>
      </article>
    </div>
  );
};
