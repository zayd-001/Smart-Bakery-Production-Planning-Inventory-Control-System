import React, { useState } from 'react';
import { EOQState } from '../types/bakery';
import { calculateEOQItem, formatIDR } from '../utils/solver';
import { EOQCurveChart } from './charts/DashboardCharts';

interface EOQViewProps {
  eoq: EOQState;
  setEOQ: React.Dispatch<React.SetStateAction<EOQState>>;
}

export const EOQView: React.FC<EOQViewProps> = ({ eoq, setEOQ }) => {
  const [selectedMaterial, setSelectedMaterial] = useState<'flour' | 'sugar' | 'eggs'>('flour');

  const materialsMeta = [
    { key: 'flour' as const, name: 'Wheat Flour', unit: 'kg', packDesc: '25 kg Commercial Sack' },
    { key: 'sugar' as const, name: 'Refined Cane Sugar', unit: 'kg', packDesc: '50 kg Commercial Sack' },
    { key: 'eggs' as const, name: 'Farm Fresh Eggs', unit: 'pcs', packDesc: '30 pcs Egg Tray' },
  ];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Economic Order Quantity (EOQ) &amp; Total Inventory Cost Analysis
        </h2>
        <p className="text-xs text-slate-500">
          Harris-Wilson deterministic lot-sizing formulation balancing annual ordering costs and inventory holding carrying expenses.
        </p>
      </div>

      {/* Input Parameters Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Annual Demand, Ordering Cost, and Holding Cost Parameters</h3>
          <p className="text-xs text-slate-500">
            Formulation: EOQ = &radic;((2 &times; D &times; S) / H) with practical supplier pack rounding
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg w-full">
          <table className="w-full min-w-[600px] text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Material</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">Annual Demand ($D$)</th>
                <th className="py-2.5 px-3">Order Setup Cost ($S$ - IDR/order)</th>
                <th className="py-2.5 px-3">Annual Holding Cost ($H$ - IDR/unit/yr)</th>
                <th className="py-2.5 px-3">Commercial Pack Increment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materialsMeta.map((m) => {
                const item = eoq[m.key];
                return (
                  <tr key={m.key} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{m.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{m.unit}</td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="1"
                        step="100"
                        value={item.D}
                        onChange={(e) =>
                          setEOQ({
                            ...eoq,
                            [m.key]: { ...item, D: Math.max(1, parseFloat(e.target.value) || 1) },
                          })
                        }
                        className="w-28 px-2 py-1 border border-slate-300 rounded focus:border-amber-500 focus:outline-none font-mono-numbers text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="1000"
                        step="5000"
                        value={item.S}
                        onChange={(e) =>
                          setEOQ({
                            ...eoq,
                            [m.key]: { ...item, S: Math.max(1, parseFloat(e.target.value) || 1) },
                          })
                        }
                        className="w-32 px-2 py-1 border border-slate-300 rounded focus:border-amber-500 focus:outline-none font-mono-numbers text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="1"
                        step="50"
                        value={item.H}
                        onChange={(e) =>
                          setEOQ({
                            ...eoq,
                            [m.key]: { ...item, H: Math.max(1, parseFloat(e.target.value) || 1) },
                          })
                        }
                        className="w-28 px-2 py-1 border border-slate-300 rounded focus:border-amber-500 focus:outline-none font-mono-numbers text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono-numbers text-[11px]">
                      {m.packDesc}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">EOQ Optimization Solutions &amp; Inventory Cost Breakdown</h3>
        <p className="text-xs text-slate-500">
          Equilibrium condition: At theoretical EOQ, Annual Ordering Cost ($TOC$) equals Annual Holding Cost ($THC$).
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-lg w-full">
          <table className="w-full min-w-[700px] text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Material</th>
                <th className="py-2.5 px-3 text-right">Theoretical EOQ</th>
                <th className="py-2.5 px-3 text-right">Practical Lot ($Q$)</th>
                <th className="py-2.5 px-3 text-right">Orders / Year ($N$)</th>
                <th className="py-2.5 px-3 text-right">Annual Order Cost ($TOC$)</th>
                <th className="py-2.5 px-3 text-right">Annual Holding Cost ($THC$)</th>
                <th className="py-2.5 px-3 text-right">Total Relevant Cost ($TRC$)</th>
                <th className="py-2.5 px-3 text-right">Replenish Cycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materialsMeta.map((m) => {
                const item = eoq[m.key];
                const res = calculateEOQItem(item.D, item.S, item.H, item.pack);
                return (
                  <tr key={m.key} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{m.name}</td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">
                      {res.theoreticalEOQ.toFixed(1)} {m.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers font-bold text-amber-700 text-right">
                      {res.practicalQ} {m.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">
                      {res.ordersPerYear.toFixed(1)} orders
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">
                      {formatIDR(res.orderingCost)}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">
                      {formatIDR(res.holdingCost)}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers font-bold text-slate-900 text-right">
                      {formatIDR(res.totalCost)}
                    </td>
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-600 text-right">
                      Every {res.cycleDays.toFixed(0)} days
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive EOQ Curve Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Inventory Cost Curve Equilibrium ($Q$ Trade-Off)
            </h3>
            <p className="text-xs text-slate-500">
              Visual confirmation of Wilson lot sizing: Minimum total cost occurs precisely where $TOC = THC$.
            </p>
          </div>

          {/* Material switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
            {materialsMeta.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelectedMaterial(m.key)}
                className={`px-3 py-1 font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedMaterial === m.key
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <EOQCurveChart
          itemKey={selectedMaterial}
          itemName={materialsMeta.find((m) => m.key === selectedMaterial)?.name || 'Flour'}
          itemUnit={materialsMeta.find((m) => m.key === selectedMaterial)?.unit || 'kg'}
          eoqParam={eoq[selectedMaterial]}
        />
      </div>
    </div>
  );
};
